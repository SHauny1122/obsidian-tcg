import type { Product } from "@/data/products";
import { getProductImage } from "@/lib/local-products";

export const cartStorageKey = "pokemon-market-cart";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity: number;
};

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    if (!storedCart) {
      return [];
    }

    const cartItems = JSON.parse(storedCart);
    return Array.isArray(cartItems) ? cartItems : [];
  } catch {
    return [];
  }
}

export function saveCartItems(cartItems: CartItem[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartCount(cartItems: CartItem[]) {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(cartItems: CartItem[]) {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function addProductToCart(product: Product, quantity = 1) {
  if (product.status === "sold") {
    return {
      ok: false,
      message: "Sold products cannot be added to cart.",
    };
  }

  const cartItems = getCartItems();
  const existingItem = cartItems.find((item) => item.slug === product.slug);
  const currentQuantity = existingItem?.quantity ?? 0;
  const nextQuantity = currentQuantity + quantity;

  if (nextQuantity > product.quantity) {
    return {
      ok: false,
      message: `Only ${product.quantity} available.`,
    };
  }

  const nextItems = existingItem
    ? cartItems.map((item) =>
        item.slug === product.slug
          ? { ...item, quantity: nextQuantity, maxQuantity: product.quantity }
          : item,
      )
    : [
        ...cartItems,
        {
          slug: product.slug,
          name: product.name,
          price: product.askingPriceZar,
          image: getProductImage(product),
          quantity,
          maxQuantity: product.quantity,
        },
      ];

  saveCartItems(nextItems);

  return {
    ok: true,
    message: `${product.name} added to cart.`,
  };
}
