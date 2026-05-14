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

  const readStoredCart = (storedCart: string | null) => {
    if (!storedCart) {
      return [];
    }

    const cartItems = JSON.parse(storedCart);
    return Array.isArray(cartItems) ? cartItems : [];
  };

  try {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    const cartItems = readStoredCart(storedCart);

    if (cartItems.length > 0) {
      return cartItems;
    }
  } catch {
    // Fall back to session storage below.
  }

  try {
    return readStoredCart(window.sessionStorage.getItem(cartStorageKey));
  } catch {
    return [];
  }
}

function persistCartItems(cartItems: CartItem[]) {
  const serializedCart = JSON.stringify(cartItems);
  let didSave = false;

  try {
    window.localStorage.setItem(cartStorageKey, serializedCart);
    didSave = true;
  } catch {
    // Some mobile/private browsers can reject localStorage writes.
  }

  try {
    window.sessionStorage.setItem(cartStorageKey, serializedCart);
    didSave = true;
  } catch {
    // If both browser stores fail, the caller should show a real error.
  }

  if (!didSave) {
    throw new Error("Could not update cart storage.");
  }
}

export function saveCartItems(cartItems: CartItem[]) {
  persistCartItems(cartItems);
  void fetch("/api/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cartItems }),
  })
    .catch(() => undefined)
    .finally(() => {
      window.dispatchEvent(new Event("cart-updated"));
    });
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

  const savedItem = getCartItems().find((item) => item.slug === product.slug);

  if (!savedItem || savedItem.quantity !== nextQuantity) {
    return {
      ok: false,
      message:
        "This browser did not save the cart item. Please refresh and try again.",
    };
  }

  return {
    ok: true,
    message: `${product.name} added to cart.`,
  };
}
