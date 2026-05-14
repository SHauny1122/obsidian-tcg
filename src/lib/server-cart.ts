import "server-only";
import type { CartItem } from "@/lib/cart";

export const serverCartCookieName = "pokemon-market-server-cart";
export const serverCartCookieMaxAge = 60 * 60 * 24 * 7;

export function parseServerCartCookie(cookieValue?: string) {
  if (!cookieValue) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(decodeURIComponent(cookieValue));
    return Array.isArray(parsedCart) ? (parsedCart as CartItem[]) : [];
  } catch {
    return [];
  }
}
