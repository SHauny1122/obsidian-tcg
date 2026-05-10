"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { addProductToCart } from "@/lib/cart";

export function AddToCartButton({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const [message, setMessage] = useState("");
  const isSold = product.status === "sold";

  function handleAddToCart() {
    const result = addProductToCart(product);
    setMessage(result.message);
  }

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
    <div className={className}>
      <button
        type="button"
        onClick={handleAddToCart}
        className="vault-button min-h-11 w-full rounded-md px-4 py-2 text-sm font-semibold shadow-sm"
      >
        Add to cart
      </button>
      {message ? (
        <p className="mt-2 rounded-md border border-stone-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          {message}{" "}
          <Link href="/cart" className="underline underline-offset-2">
            View cart
          </Link>
        </p>
      ) : null}
    </div>
  );
}
