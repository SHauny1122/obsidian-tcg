"use client";

import Link from "next/link";
import { shopConfig } from "@/config/shop";
import { useCartCount } from "@/hooks/useCartCount";

export function SiteHeader() {
  const cartCount = useCartCount();

  return (
    <header className="sticky top-0 z-30 border-b border-amber-300/15 bg-[#080806]/95 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-bold tracking-wide text-amber-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/obsidian.png"
            alt="Obsidian TCG logo"
            className="h-10 w-10 rounded-full object-contain"
          />
          <span>{shopConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-3 overflow-x-auto text-sm font-medium text-stone-500 sm:gap-4">
          <Link href="/" className="whitespace-nowrap hover:text-amber-200">
            Home
          </Link>
          <Link href="/cards" className="hover:text-amber-200">
            Cards
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-200 px-3 py-2 font-semibold text-stone-950 hover:bg-stone-50"
          >
            Cart
            {cartCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 py-0.5 text-xs font-bold">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link href="/checkout" className="hover:text-amber-200">
            Checkout
          </Link>
        </nav>
      </div>
    </header>
  );
}
