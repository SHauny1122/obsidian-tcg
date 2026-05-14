create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  set_name text not null,
  card_number text,
  category text not null check (category in ('singles', 'bundles', 'bulk', 'accessories')),
  finish text not null default 'normal' check (finish in ('normal', 'holofoil', 'reverse-holofoil')),
  condition text not null,
  quantity integer not null default 0 check (quantity >= 0),
  asking_price_zar integer not null check (asking_price_zar > 0),
  status text not null default 'available' check (status in ('available', 'sold')),
  image_url text,
  image_path text,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
add column if not exists finish text not null default 'normal';

alter table public.products
drop constraint if exists products_finish_check;

alter table public.products
add constraint products_finish_check
check (finish in ('normal', 'holofoil', 'reverse-holofoil'));

create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_finish_idx on public.products (finish);
create index if not exists products_created_at_idx on public.products (created_at desc);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  paystack_reference text not null unique,
  buyer jsonb not null,
  cart_items jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null check (total > 0),
  currency text not null default 'ZAR',
  status text not null default 'paid' check (status in ('paid', 'failed', 'refunded')),
  notification_status text not null default 'pending',
  paystack_payload jsonb not null,
  paid_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public product images are readable" on storage.objects;
create policy "Public product images are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.complete_paid_order(
  p_reference text,
  p_buyer jsonb,
  p_cart_items jsonb,
  p_subtotal integer,
  p_delivery_fee integer,
  p_total integer,
  p_currency text,
  p_paystack_payload jsonb,
  p_paid_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_order public.orders%rowtype;
  item jsonb;
  item_slug text;
  item_quantity integer;
  product_record public.products%rowtype;
  created_order public.orders%rowtype;
begin
  select * into existing_order
  from public.orders
  where paystack_reference = p_reference;

  if found then
    return jsonb_build_object(
      'order_id', existing_order.id,
      'already_processed', true
    );
  end if;

  for item in select * from jsonb_array_elements(p_cart_items)
  loop
    item_slug := item->>'slug';
    item_quantity := (item->>'quantity')::integer;

    select * into product_record
    from public.products
    where slug = item_slug
    for update;

    if not found then
      raise exception 'Product % is no longer available.', item_slug;
    end if;

    if product_record.status = 'sold' or product_record.quantity < item_quantity then
      raise exception 'Insufficient stock for %.', product_record.name;
    end if;
  end loop;

  for item in select * from jsonb_array_elements(p_cart_items)
  loop
    item_slug := item->>'slug';
    item_quantity := (item->>'quantity')::integer;

    update public.products
    set
      quantity = quantity - item_quantity,
      status = case when quantity - item_quantity <= 0 then 'sold' else status end
    where slug = item_slug;
  end loop;

  insert into public.orders (
    paystack_reference,
    buyer,
    cart_items,
    subtotal,
    delivery_fee,
    total,
    currency,
    status,
    paystack_payload,
    paid_at
  )
  values (
    p_reference,
    p_buyer,
    p_cart_items,
    p_subtotal,
    p_delivery_fee,
    p_total,
    p_currency,
    'paid',
    p_paystack_payload,
    p_paid_at
  )
  returning * into created_order;

  return jsonb_build_object(
    'order_id', created_order.id,
    'already_processed', false
  );
end;
$$;

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public products are readable" on public.products;
create policy "Public products are readable"
on public.products for select
to anon, authenticated
using (true);

-- Admin writes and order finalization are performed by the server with the
-- Supabase service role key. Do not expose the service role key to the browser.
