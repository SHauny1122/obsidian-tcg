"use client";

import { useEffect, useState } from "react";
import { getCartCount, getCartItems } from "@/lib/cart";

export function useCartCount() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCartCount = () => setCartCount(getCartCount(getCartItems()));

    loadCartCount();
    window.addEventListener("storage", loadCartCount);
    window.addEventListener("cart-updated", loadCartCount);

    return () => {
      window.removeEventListener("storage", loadCartCount);
      window.removeEventListener("cart-updated", loadCartCount);
    };
  }, []);

  return cartCount;
}
