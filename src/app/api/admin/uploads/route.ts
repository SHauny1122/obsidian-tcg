import { NextRequest, NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const maxUploadBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function fileExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export async function POST(request: NextRequest) {
  const denied = assertAdminRequest(request);

  if (denied) {
    return denied;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG, or WebP image." },
        { status: 400 },
      );
    }

    if (file.size > maxUploadBytes) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller after compression." },
        { status: 400 },
      );
    }

    const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET ?? "product-images";
    const path = `cards/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${fileExtension(file)}`;
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      path,
      publicUrl: data.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not upload image.",
      },
      { status: 400 },
    );
  }
}
