"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatZar } from "@/components/ProductCard";
import { shopConfig } from "@/config/shop";
import {
  CartItem,
  getCartItems,
  getCartSubtotal,
  saveCartItems,
} from "@/lib/cart";

export function CartView({
  initialCartItems = [],
}: {
  initialCartItems?: CartItem[];
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  useEffect(() => {
    const loadCart = async () => {
      const localCartItems = getCartItems();

      if (localCartItems.length > 0) {
        setCartItems(localCartItems);
        return;
      }

      try {
        const response = await fetch("/api/cart");
        const data = await response.json();

        if (response.ok && Array.isArray(data.cartItems)) {
          setCartItems(data.cartItems);
          if (data.cartItems.length > 0) {
            saveCartItems(data.cartItems);
          }
        }
      } catch {
        setCartItems(initialCartItems);
      }
    };

    void loadCart();
    window.addEventListener("storage", loadCart);
    window.addEventListener("cart-updated", loadCart);

    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("cart-updated", loadCart);
    };
  }, [initialCartItems]);

  const subtotal = useMemo(() => getCartSubtotal(cartItems), [cartItems]);

  function updateQuantity(slug: string, quantity: number) {
    const updatedItems = cartItems.map((item) =>
      item.slug === slug
        ? {
            ...item,
            quantity: Math.min(Math.max(quantity, 1), item.maxQuantity),
          }
        : item,
    );

    saveCartItems(updatedItems);
    setCartItems(updatedItems);
  }

  function removeItem(slug: string) {
    const updatedItems = cartItems.filter((item) => item.slug !== slug);

    saveCartItems(updatedItems);
    setCartItems(updatedItems);
  }

  function clearCart() {
    saveCartItems([]);
    setCartItems([]);
  }

  if (cartItems.length === 0) {
    return (
      <section className="vault-panel rounded-lg border-dashed p-8 text-center">
        <h1 className="text-3xl font-bold text-stone-950">
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Browse the available cards and add anything you want to enquire about.
        </p>
        <Link
          href="/cards?category=singles"
          className="vault-button mt-6 inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold shadow-sm"
        >
          Browse cards
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <section className="space-y-4">
        {cartItems.map((item) => (
          <article
            key={item.slug}
            className="vault-panel rounded-lg p-4"
          >
            <div className="flex gap-4">
              <Link
                href={`/cards/${item.slug}`}
                className="h-24 w-20 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={`${item.name} cart item`}
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/cards/${item.slug}`}
                  className="font-semibold text-stone-950 hover:text-emerald-800"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-stone-600">
                  {formatZar(item.price)} each
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Max available: {item.maxQuantity}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-10 w-10 rounded-md border border-stone-300 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Decrease ${item.name} quantity`}
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-stone-950">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                  disabled={item.quantity >= item.maxQuantity}
                  className="h-10 w-10 rounded-md border border-stone-300 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Increase ${item.name} quantity`}
                >
                  +
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="text-sm font-bold text-amber-200">
                  {formatZar(item.price * item.quantity)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.slug)}
                  className="min-h-10 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="vault-panel rounded-lg p-5">
        <h2 className="text-xl font-bold text-stone-950">Cart summary</h2>
        <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
          <span className="text-sm font-medium text-stone-600">Subtotal</span>
          <span className="text-2xl font-bold text-amber-200">
            {formatZar(subtotal)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Checkout continues on the website with Paystack, and totals are shown
          in {shopConfig.currency}.
        </p>

        <div className="mt-5 grid gap-3">
          <Link
            href="/checkout"
            className="vault-button inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold shadow-sm"
          >
            Checkout
          </Link>
          <Link
            href="/cards?category=singles"
            className="vault-button-secondary inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="min-h-12 rounded-md border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Clear cart
          </button>
        </div>
      </aside>
    </div>
  );
}
