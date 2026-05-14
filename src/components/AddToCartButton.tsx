import type { Product } from "@/data/products";

export function AddToCartButton({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const isSold = product.status === "sold";

  if (isSold) {
    return (
      <div className={className}>
        <button
          type="button"
          disabled
          className="min-h-11 w-full cursor-not-allowed rounded-md border border-stone-200 bg-stone-200 px-4 py-2 text-sm font-semibold text-stone-500"
        >
          Sold
        </button>
      </div>
    );
  }

  return (
    <form action="/api/cart" method="post" className={className}>
      <input type="hidden" name="slug" value={product.slug} />
      <input type="hidden" name="quantity" value="1" />
      <input type="hidden" name="redirectTo" value="/cart" />
      <button
        type="submit"
        className="vault-button min-h-11 w-full rounded-md px-4 py-2 text-sm font-semibold shadow-sm"
      >
        Add to cart
      </button>
    </form>
  );
}
