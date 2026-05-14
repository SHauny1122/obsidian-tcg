import "server-only";
import { NextRequest, NextResponse } from "next/server";

export function assertAdminRequest(request: NextRequest) {
  const adminPassword =
    process.env.ADMIN_PASSWORD ??
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ??
    "vault-dev";
  const submittedPassword = request.headers.get("x-admin-password");

  if (!submittedPassword || submittedPassword !== adminPassword) {
    return NextResponse.json({ error: "Admin access denied." }, { status: 401 });
  }

  return undefined;
}
