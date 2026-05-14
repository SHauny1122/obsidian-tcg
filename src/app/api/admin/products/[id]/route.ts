import { NextRequest, NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/admin-auth";
import { deleteProduct, upsertProduct } from "@/lib/products-repository";
import { parseProductPayload } from "@/lib/product-validation";

export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> },
) {
  const denied = assertAdminRequest(request);

  if (denied) {
    return denied;
  }

  try {
    const { id } = await segmentData.params;
    const product = await upsertProduct(
      parseProductPayload(await request.json()),
      id,
    );

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update product.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> },
) {
  const denied = assertAdminRequest(request);

  if (denied) {
    return denied;
  }

  try {
    const { id } = await segmentData.params;

    await deleteProduct(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete product.",
      },
      { status: 400 },
    );
  }
}
