import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { productFinishes, type Product } from "@/data/products";
import { getProductImage } from "@/lib/local-products";

export function formatZar(amount: number) {
  return `R ${amount.toFixed(2)}`;
}

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const isSold = product.status === "sold";
  const finishLabel =
    productFinishes.find((finish) => finish.value === product.finish)?.label ??
    "Normal";

  return (
    <article className="vault-panel overflow-hidden rounded-lg">
      <Link href={`/cards/${product.slug}`} className="block">
        <div
          className={`relative overflow-hidden rounded-md border border-stone-200 bg-stone-100 ${
            compact
              ? "m-2 aspect-[3/4] sm:m-3 sm:aspect-[4/5]"
              : "m-3 aspect-[4/5]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getProductImage(product)}
            alt={`${product.name} card image`}
            className={`h-full w-full object-cover ${isSold ? "opacity-70 grayscale" : ""}`}
          />
          {isSold ? (
            <span
              className={`absolute rounded-full bg-stone-950 font-bold shadow-sm ${
                compact
                  ? "left-2 top-2 px-2 py-0.5 text-[10px] sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs"
                  : "left-3 top-3 px-3 py-1 text-xs"
              }`}
            >
              SOLD
            </span>
          ) : null}
          {!isSold && product.quantity <= 2 ? (
            <span
              className={`absolute rounded-full bg-amber-100 font-bold text-amber-900 shadow-sm ${
                compact
                  ? "bottom-2 left-2 px-2 py-0.5 text-[10px] sm:bottom-3 sm:left-3 sm:px-3 sm:py-1 sm:text-xs"
                  : "bottom-3 left-3 px-3 py-1 text-xs"
              }`}
            >
              Only {product.quantity} left
            </span>
          ) : null}
        </div>
      </Link>
      <div className={compact ? "space-y-2 p-3 sm:space-y-3 sm:p-4" : "space-y-3 p-4"}>
        <div className={compact ? "grid gap-2 sm:flex sm:items-start sm:justify-between sm:gap-3" : "flex items-start justify-between gap-3"}>
          <div className="min-w-0">
            <h3
              className={`font-semibold text-stone-950 ${
                compact
                  ? "line-clamp-2 text-sm leading-5 sm:text-base"
                  : "text-base"
              }`}
            >
              <Link href={`/cards/${product.slug}`}>{product.name}</Link>
            </h3>
            <p
              className={`mt-1 text-stone-600 ${
                compact ? "line-clamp-1 text-xs sm:text-sm" : "text-sm"
              }`}
            >
              {product.setName}
            </p>
          </div>
          <span
            className={`w-fit rounded-full font-semibold capitalize ${
              isSold
                ? "vault-badge"
                : "vault-badge-gold"
            } ${compact ? "hidden px-2 py-0.5 text-[10px] sm:inline-flex sm:px-2.5 sm:py-1 sm:text-xs" : "px-2.5 py-1 text-xs"}`}
          >
            {product.status}
          </span>
        </div>
        {compact ? (
          <div className="grid grid-cols-2 items-end gap-2 text-xs sm:hidden">
            <div>
              <p className="text-stone-500">Qty</p>
              <p className="font-semibold text-stone-900">{product.quantity}</p>
            </div>
            <div>
              <p className="text-stone-500">Price</p>
              <p className="font-bold text-amber-200">
                {formatZar(product.askingPriceZar)}
              </p>
            </div>
          </div>
        ) : null}
        <dl className={compact ? "hidden grid-cols-2 gap-1.5 text-xs sm:grid sm:gap-2 sm:text-sm" : "grid grid-cols-2 gap-2 text-sm"}>
          <div>
            <dt className="text-stone-500">Condition</dt>
            <dd className="font-medium text-stone-900">
              {product.condition}
              <span className="block text-stone-500">{finishLabel}</span>
            </dd>
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
        <AddToCartButton
          product={product}
          buttonClassName={compact ? "min-h-10 px-3 py-2 text-xs sm:min-h-11 sm:px-4 sm:text-sm" : ""}
        />
      </div>
    </article>
  );
}
