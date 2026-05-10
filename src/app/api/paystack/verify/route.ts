import { NextRequest, NextResponse } from "next/server";

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

  if (isSuccess) {
    // TODO: Save the paid order to the database once persistence is added.
    // TODO: Reduce product stock only after the paid order has been saved safely.
  }

  return NextResponse.json({
    success: isSuccess,
    status: data.data?.status,
    reference: data.data?.reference ?? reference,
    amount: data.data?.amount,
    currency: data.data?.currency,
  });
}
