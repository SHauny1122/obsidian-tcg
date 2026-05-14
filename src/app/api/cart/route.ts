import { NextRequest, NextResponse } from "next/server";
import type { CartItem } from "@/lib/cart";
import { listProducts } from "@/lib/products-repository";
import {
  parseServerCartCookie,
  serverCartCookieMaxAge,
  serverCartCookieName,
} from "@/lib/server-cart";

type CartPayload = {
  slug?: string;
  quantity?: number;
  cartItems?: CartItem[];
  redirectTo?: string;
};

function readCart(request: NextRequest): CartItem[] {
  return parseServerCartCookie(request.cookies.get(serverCartCookieName)?.value);
}

function writeCartCookie(response: NextResponse, cartItems: CartItem[]) {
  response.cookies.set(serverCartCookieName, encodeURIComponent(JSON.stringify(cartItems)), {
    httpOnly: true,
    maxAge: serverCartCookieMaxAge,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

function cartResponse(cartItems: CartItem[]) {
  return writeCartCookie(NextResponse.json({ cartItems }), cartItems);
}

async function readPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return {
      payload: (await request.json()) as CartPayload,
      wantsRedirect: false,
    };
  }

  const formData = await request.formData();

  return {
    payload: {
      slug: String(formData.get("slug") ?? ""),
      quantity: Number(formData.get("quantity") ?? 1),
      redirectTo: String(formData.get("redirectTo") ?? "/cart"),
    },
    wantsRedirect: true,
  };
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ cartItems: readCart(request) });
}

export async function POST(request: NextRequest) {
  const { payload, wantsRedirect } = await readPayload(request);
  const slug = String(payload.slug ?? "");
  const quantity = Number(payload.quantity ?? 1);

  if (!slug || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { error: "A valid product and quantity are required." },
      { status: 400 },
    );
  }

  const products = await listProducts();
  const product = products.find((currentProduct) => currentProduct.slug === slug);

  if (!product || product.status === "sold") {
    return NextResponse.json(
      { error: "This product is no longer available." },
      { status: 400 },
    );
  }

  const cartItems = readCart(request);
  const existingItem = cartItems.find((item) => item.slug === product.slug);
  const currentQuantity = existingItem?.quantity ?? 0;
  const nextQuantity = currentQuantity + quantity;

  if (nextQuantity > product.quantity) {
    return NextResponse.json(
      { error: `Only ${product.quantity} available.` },
      { status: 400 },
    );
  }

  const nextCartItems = existingItem
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
          image: product.imageUrl || product.uploadedImage || product.image,
          quantity,
          maxQuantity: product.quantity,
        },
      ];

  if (wantsRedirect) {
    const redirectPath =
      payload.redirectTo && payload.redirectTo.startsWith("/")
        ? payload.redirectTo
        : "/cart";
    return writeCartCookie(
      new NextResponse(null, {
        status: 303,
        headers: {
          Location: redirectPath,
        },
      }),
      nextCartItems,
    );
  }

  return cartResponse(nextCartItems);
}

export async function PUT(request: NextRequest) {
  const payload = (await request.json()) as CartPayload;
  const cartItems = Array.isArray(payload.cartItems) ? payload.cartItems : [];

  return cartResponse(cartItems);
}
