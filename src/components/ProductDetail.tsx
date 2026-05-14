"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatZar } from "@/components/ProductCard";
import { shopConfig } from "@/config/shop";
import { productFinishes, type Product } from "@/data/products";
import { getProductImage } from "@/lib/local-products";

export function ProductDetail({
  slug,
  initialProducts,
}: {
  slug: string;
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      const response = await fetch("/api/products");
      const data = await response.json();

      if (isMounted && response.ok && Array.isArray(data.products)) {
        setProducts(data.products);
      }

      if (isMounted) {
        setHasLoaded(true);
      }
    }

    loadProducts();
    window.addEventListener("products-updated", loadProducts);

    return () => {
      isMounted = false;
      window.removeEventListener("products-updated", loadProducts);
    };
  }, []);

  const product = useMemo(
    () => products.find((item) => item.slug === slug),
    [products, slug],
  );

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/cards?category=singles"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          Back to cards
        </Link>
        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-stone-950">
            {hasLoaded ? "Product not found" : "Loading product..."}
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {hasLoaded
              ? "This product may have been deleted or sold out."
              : "Checking the shared inventory database."}
          </p>
        </section>
      </main>
    );
  }

  const message = encodeURIComponent(
    `Hi, I am interested in ${product.name} (${product.setName}) listed for ${formatZar(
      product.askingPriceZar,
    )}. Is it still available?`,
  );

  const whatsappHref = shopConfig.whatsappSupportNumber
    ? `https://wa.me/${shopConfig.whatsappSupportNumber}?text=${message}`
    : `https://wa.me/?text=${message}`;
  const isSold = product.status === "sold";
  const finishLabel =
    productFinishes.find((finish) => finish.value === product.finish)?.label ??
    "Normal";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/cards?category=singles"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
      >
        Back to cards
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-start">
        <div className="vault-panel relative aspect-[4/5] overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getProductImage(product)}
            alt={`${product.name} card image`}
            className={`h-full w-full object-cover ${isSold ? "opacity-70 grayscale" : ""}`}
          />
          {isSold ? (
            <span className="absolute left-4 top-4 rounded-full bg-stone-950 px-3 py-1 text-xs font-bold text-white shadow-sm">
              SOLD
            </span>
          ) : null}
          {!isSold && product.quantity <= 2 ? (
            <span className="absolute bottom-4 left-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
              Only {product.quantity} left
            </span>
          ) : null}
        </div>

        <section className="vault-panel space-y-6 rounded-lg p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  isSold
                    ? "vault-badge"
                    : "vault-badge-gold"
                }`}
              >
                {product.status}
              </span>
              <span className="text-sm font-medium text-stone-500">
                Seller manual asking price
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-950">
              {product.name}
            </h1>
              <p className="mt-3 text-3xl font-bold text-amber-200">
              {formatZar(product.askingPriceZar)}
            </p>
            <p className="mt-4 leading-7 text-stone-600">
              {product.description}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 rounded-lg border border-stone-200 bg-white/40 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-stone-500">Set name</dt>
              <dd className="mt-1 font-semibold text-stone-950">
                {product.setName}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Card number</dt>
              <dd className="mt-1 font-semibold text-stone-950">
                {product.cardNumber ?? "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Condition</dt>
              <dd className="mt-1 font-semibold text-stone-950">
                {product.condition}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Finish</dt>
              <dd className="mt-1 font-semibold text-stone-950">
                {finishLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Quantity</dt>
              <dd className="mt-1 font-semibold text-stone-950">
                {product.quantity}
              </dd>
            </div>
          </dl>

          {isSold ? (
            <span className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-md border border-stone-200 bg-stone-200 px-5 py-3 text-sm font-semibold text-stone-500 shadow-sm sm:w-auto">
              Sold - cart disabled
            </span>
          ) : (
            <div className="max-w-sm">
              <AddToCartButton product={product} />
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="vault-button-secondary mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-md px-5 py-3 text-sm font-semibold"
              >
                Ask a question
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
