"use client";

import { useEffect, useState } from "react";
import { getCartCount, getCartItems } from "@/lib/cart";

export function useCartCount() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCartCount = async () => {
      const localCartItems = getCartItems();

      if (localCartItems.length > 0) {
        setCartCount(getCartCount(localCartItems));
        return;
      }

      try {
        const response = await fetch("/api/cart");
        const data = await response.json();

        if (response.ok && Array.isArray(data.cartItems)) {
          setCartCount(getCartCount(data.cartItems));
          return;
        }
      } catch {
        // Keep the current count if the server cart cannot be reached.
      }

      setCartCount(0);
    };

    void loadCartCount();
    window.addEventListener("storage", loadCartCount);
    window.addEventListener("cart-updated", loadCartCount);

    return () => {
      window.removeEventListener("storage", loadCartCount);
      window.removeEventListener("cart-updated", loadCartCount);
    };
  }, []);

  return cartCount;
}
