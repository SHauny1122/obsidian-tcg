import { NextRequest, NextResponse } from "next/server";
import { finalizePaidOrder, type PaidOrderItem } from "@/lib/orders-repository";
import { queueSellerNotification } from "@/lib/seller-notifications";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function parseCartItems(value: unknown): PaidOrderItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const record = asRecord(item);
    const slug = String(record.slug ?? "");
    const name = String(record.name ?? "");
    const price = asNumber(record.price);
    const quantity = asNumber(record.quantity);
    const lineTotal = asNumber(record.lineTotal, price * quantity);

    if (!slug || !name || price <= 0 || quantity <= 0) {
      return [];
    }

    return [
      {
        slug,
        name,
        price,
        quantity,
        lineTotal,
      },
    ];
  });
}

export async function GET(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const reference = request.nextUrl.searchParams.get("reference");

  if (!secretKey) {
    return NextResponse.json(
      { error: "Paystack secret key is not configured." },
      { status: 500 },
    );
  }

  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is required." },
      { status: 400 },
    );
  }

  const paystackResponse = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  const data = await paystackResponse.json();

  if (!paystackResponse.ok || !data.status) {
    return NextResponse.json(
      { error: data.message ?? "Could not verify Paystack payment." },
      { status: 502 },
    );
  }

  const isSuccess = data.data?.status === "success";
  let orderResult = null;

  if (isSuccess) {
    const metadata = asRecord(data.data?.metadata);
    const totals = asRecord(metadata.totals);
    const buyer = asRecord(metadata.buyer);
    const cartItems = parseCartItems(metadata.cart);
    const amountInZar = asNumber(data.data?.amount) / 100;
    const total = asNumber(totals.total, amountInZar);

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Payment metadata did not include order items." },
        { status: 502 },
      );
    }

    try {
      orderResult = await finalizePaidOrder({
        reference: data.data?.reference ?? reference,
        buyer,
        cartItems,
        subtotal: asNumber(totals.subtotal, total),
        deliveryFee: asNumber(totals.deliveryFee, 0),
        total,
        currency: data.data?.currency ?? "ZAR",
        paystackPayload: data.data,
        paidAt: data.data?.paid_at ?? new Date().toISOString(),
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not save paid order.",
        },
        { status: 500 },
      );
    }

    try {
      await queueSellerNotification({
        orderId: orderResult?.order_id,
        reference: data.data?.reference ?? reference,
        buyerEmail: typeof buyer.email === "string" ? buyer.email : undefined,
        buyerName:
          typeof buyer.fullName === "string" ? buyer.fullName : undefined,
        buyerPhone: typeof buyer.phone === "string" ? buyer.phone : undefined,
        deliveryMethod:
          typeof buyer.deliveryMethod === "string"
            ? buyer.deliveryMethod
            : undefined,
        deliveryAddress:
          typeof buyer.deliveryAddress === "string"
            ? buyer.deliveryAddress
            : undefined,
        cartItems,
        subtotal: asNumber(totals.subtotal, total),
        deliveryFee: asNumber(totals.deliveryFee, 0),
        currency: data.data?.currency ?? "ZAR",
        total,
      });
    } catch (error) {
      console.error("Order notification failed", error);
    }
  }

  return NextResponse.json({
    success: isSuccess,
    status: data.data?.status,
    reference: data.data?.reference ?? reference,
    amount: data.data?.amount,
    currency: data.data?.currency,
    order: orderResult,
  });
}
