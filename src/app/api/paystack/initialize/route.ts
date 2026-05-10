import { NextRequest, NextResponse } from "next/server";
import { shopConfig } from "@/config/shop";
import type { CartItem } from "@/lib/cart";

type BuyerDetails = {
  fullName?: string;
  email?: string;
  phone?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
};

type InitializePayload = {
  buyerDetails?: BuyerDetails;
  cartItems?: CartItem[];
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
};

function isValidCartItem(item: Partial<CartItem>): item is CartItem {
  return (
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price > 0 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.maxQuantity === "number" &&
    Number.isInteger(item.maxQuantity) &&
    item.maxQuantity > 0 &&
    item.quantity <= item.maxQuantity
  );
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Paystack secret key is not configured." },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as InitializePayload;
  const buyerDetails = payload.buyerDetails;
  const cartItems = payload.cartItems ?? [];

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  if (!buyerDetails?.email) {
    return NextResponse.json(
      { error: "Buyer email is required." },
      { status: 400 },
    );
  }

  if (!cartItems.every(isValidCartItem)) {
    return NextResponse.json(
      { error: "Cart contains invalid items." },
      { status: 400 },
    );
  }

  const recalculatedSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = Number.isFinite(payload.deliveryFee)
    ? Number(payload.deliveryFee)
    : 0;
  const recalculatedTotal = recalculatedSubtotal + deliveryFee;

  if (recalculatedTotal <= 0) {
    return NextResponse.json(
      { error: "Total must be greater than zero." },
      { status: 400 },
    );
  }

  const reference = `obsidian-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const callbackUrl = `${siteUrl}/payment/callback?reference=${reference}`;

  const paystackResponse = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: buyerDetails.email,
        amount: Math.round(recalculatedTotal * 100),
        currency: shopConfig.currency,
        reference,
        callback_url: callbackUrl,
        metadata: {
          buyer: buyerDetails,
          delivery: {
            method: buyerDetails.deliveryMethod,
            address: buyerDetails.deliveryAddress,
          },
          cart: cartItems.map((item) => ({
            slug: item.slug,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            lineTotal: item.price * item.quantity,
          })),
          totals: {
            submittedSubtotal: payload.subtotal,
            submittedTotal: payload.total,
            subtotal: recalculatedSubtotal,
            deliveryFee,
            total: recalculatedTotal,
          },
        },
      }),
    },
  );

  const data = await paystackResponse.json();

  if (!paystackResponse.ok || !data.status) {
    return NextResponse.json(
      { error: data.message ?? "Could not initialize Paystack payment." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference ?? reference,
  });
}
