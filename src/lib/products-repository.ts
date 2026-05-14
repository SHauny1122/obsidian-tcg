import "server-only";
import type {
  Product,
  ProductCategory,
  ProductFinish,
  ProductStatus,
} from "@/data/products";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  set_name: string;
  card_number: string | null;
  category: ProductCategory;
  finish: ProductFinish | null;
  condition: string;
  quantity: number;
  asking_price_zar: number;
  status: ProductStatus;
  image_url: string | null;
  image_path: string | null;
  description: string;
  created_at: string;
};

export type ProductInput = {
  name: string;
  setName: string;
  cardNumber?: string;
  category: ProductCategory;
  finish: ProductFinish;
  condition: string;
  quantity: number;
  askingPriceZar: number;
  status: ProductStatus;
  imageUrl?: string;
  imagePath?: string;
  description: string;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    setName: row.set_name,
    cardNumber: row.card_number ?? undefined,
    category: row.category,
    finish: row.finish ?? "normal",
    condition: row.condition,
    quantity: row.quantity,
    askingPriceZar: row.asking_price_zar,
    status: row.status,
    image: row.image_url || "/images/card-gray.svg",
    imageUrl: row.image_url ?? undefined,
    imagePath: row.image_path ?? undefined,
    description: row.description,
  };
}

export function createSlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `product-${Date.now()}`;
}

export async function listProducts() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductBySlugFromDatabase(slug: string) {
  if (!isSupabaseConfigured()) {
    return undefined;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? rowToProduct(data as ProductRow) : undefined;
}

export async function upsertProduct(input: ProductInput, productId?: string) {
  const supabase = createSupabaseAdminClient();
  const baseSlug = createSlug(input.name);
  let slug = baseSlug;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data: existing, error } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!existing || existing.id === productId) {
      break;
    }

    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
  }

  const payload = {
    slug,
    name: input.name,
    set_name: input.setName,
    card_number: input.cardNumber || null,
    category: input.category,
    finish: input.finish,
    condition: input.condition,
    quantity: input.quantity,
    asking_price_zar: input.askingPriceZar,
    status: input.quantity <= 0 ? "sold" : input.status,
    image_url: input.imageUrl || null,
    image_path: input.imagePath || null,
    description: input.description,
    updated_at: new Date().toISOString(),
  };

  const query = productId
    ? supabase.from("products").update(payload).eq("id", productId).select("*")
    : supabase.from("products").insert(payload).select("*");

  const { data, error } = await query.single();

  if (error) {
    throw new Error(error.message);
  }

  return rowToProduct(data as ProductRow);
}

export async function deleteProduct(productId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }
}
