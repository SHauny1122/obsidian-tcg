"use client";

import Link from "next/link";
import { useCartCount } from "@/hooks/useCartCount";

export function MobileBottomNav() {
  const cartCount = useCartCount();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-300/15 bg-[#020606]/95 px-3 py-2 shadow-[0_-8px_24px_rgba(0,0,0,0.45)] backdrop-blur sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 text-center text-xs font-semibold text-stone-700">
        <Link href="/" className="rounded-md px-2 py-2 hover:bg-stone-50 hover:text-cyan-200">
          Home
        </Link>
        <Link
          href="/cards?category=singles"
          className="rounded-md px-2 py-2 hover:bg-stone-50 hover:text-cyan-200"
        >
          Cards
        </Link>
        <Link
          href="/cart"
          className="relative rounded-md px-2 py-2 hover:bg-stone-50 hover:text-cyan-200"
        >
          Cart
          {cartCount > 0 ? (
            <span className="absolute right-2 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold">
              {cartCount}
            </span>
          ) : null}
        </Link>
        <Link
          href="/checkout"
          className="rounded-md px-2 py-2 hover:bg-stone-50 hover:text-cyan-200"
        >
          Pay
        </Link>
      </div>
    </nav>
  );
}
