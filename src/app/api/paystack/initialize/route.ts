import { NextRequest, NextResponse } from "next/server";
import { getDeliveryOption } from "@/config/delivery";
import { shopConfig } from "@/config/shop";
import type { CartItem } from "@/lib/cart";
import { listProducts } from "@/lib/products-repository";

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

type VerifiedCartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
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

  if (!buyerDetails.fullName || !buyerDetails.phone) {
    return NextResponse.json(
      { error: "Buyer name and phone number are required." },
      { status: 400 },
    );
  }

  const deliveryOption = getDeliveryOption(buyerDetails.deliveryMethod);

  if (!deliveryOption) {
    return NextResponse.json(
      { error: "Choose a valid delivery option." },
      { status: 400 },
    );
  }

  if (!buyerDetails.deliveryAddress?.trim()) {
    return NextResponse.json(
      { error: `${deliveryOption.detailsLabel} is required.` },
      { status: 400 },
    );
  }

  if (!cartItems.every(isValidCartItem)) {
    return NextResponse.json(
      { error: "Cart contains invalid items." },
      { status: 400 },
    );
  }

  let products;

  try {
    products = await listProducts();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not validate inventory.",
      },
      { status: 500 },
    );
  }

  const productBySlug = new Map(
    products.map((product) => [product.slug, product]),
  );
  const verifiedCartItems: VerifiedCartItem[] = [];

  for (const item of cartItems) {
    const product = productBySlug.get(item.slug);

    if (!product) {
      return NextResponse.json(
        { error: `${item.name} is no longer available.` },
        { status: 400 },
      );
    }

    if (product.status === "sold" || product.quantity < item.quantity) {
      return NextResponse.json(
        { error: `${product.name} does not have enough stock.` },
        { status: 400 },
      );
    }

    verifiedCartItems.push({
      slug: product.slug,
      name: product.name,
      price: product.askingPriceZar,
      quantity: item.quantity,
      lineTotal: product.askingPriceZar * item.quantity,
    });
  }

  const recalculatedSubtotal = verifiedCartItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0,
  );
  const deliveryFee = deliveryOption.feeZar;
  const recalculatedTotal = recalculatedSubtotal + deliveryFee;

  if (recalculatedTotal <= 0) {
    return NextResponse.json(
      { error: "Total must be greater than zero." },
      { status: 400 },
    );
  }

  const reference = `collectiq-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
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
            method: deliveryOption.label,
            address: buyerDetails.deliveryAddress,
          },
          cart: verifiedCartItems,
          totals: {
            submittedSubtotal: payload.subtotal,
            submittedTotal: payload.total,
            submittedDeliveryFee: payload.deliveryFee,
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
