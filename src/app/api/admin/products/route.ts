import { NextRequest, NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/admin-auth";
import { listProducts, upsertProduct } from "@/lib/products-repository";
import { parseProductPayload } from "@/lib/product-validation";

export async function GET(request: NextRequest) {
  const denied = assertAdminRequest(request);

  if (denied) {
    return denied;
  }

  try {
    const products = await listProducts();

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load products.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = assertAdminRequest(request);

  if (denied) {
    return denied;
  }

  try {
    const product = await upsertProduct(parseProductPayload(await request.json()));

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save product.",
      },
      { status: 400 },
    );
  }
}
