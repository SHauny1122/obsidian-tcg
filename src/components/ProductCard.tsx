import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { shopConfig } from "@/config/shop";
import type { Product } from "@/data/products";
import { getProductImage } from "@/lib/local-products";

const currencyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: shopConfig.currency,
  maximumFractionDigits: 0,
});

export function formatZar(amount: number) {
  return currencyFormatter.format(amount);
}

export function ProductCard({ product }: { product: Product }) {
  const isSold = product.status === "sold";

  return (
    <article className="vault-panel overflow-hidden rounded-lg">
      <Link href={`/cards/${product.slug}`} className="block">
        <div className="relative m-3 aspect-[4/5] overflow-hidden rounded-md border border-stone-200 bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getProductImage(product)}
            alt={`${product.name} card image`}
            className={`h-full w-full object-cover ${isSold ? "opacity-70 grayscale" : ""}`}
          />
          {isSold ? (
            <span className="absolute left-3 top-3 rounded-full bg-stone-950 px-3 py-1 text-xs font-bold shadow-sm">
              SOLD
            </span>
          ) : null}
          {!isSold && product.quantity <= 2 ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
              Only {product.quantity} left
            </span>
          ) : null}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-stone-950">
              <Link href={`/cards/${product.slug}`}>{product.name}</Link>
            </h3>
            <p className="mt-1 text-sm text-stone-600">{product.setName}</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
              isSold
                ? "vault-badge"
                : "vault-badge-gold"
            }`}
          >
            {product.status}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-stone-500">Condition</dt>
            <dd className="font-medium text-stone-900">{product.condition}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Quantity</dt>
            <dd className="font-medium text-stone-900">{product.quantity}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Card no.</dt>
            <dd className="font-medium text-stone-900">
              {product.cardNumber ?? "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">Price</dt>
            <dd className="font-bold text-amber-200">
              {formatZar(product.askingPriceZar)}
            </dd>
          </div>
        </dl>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
