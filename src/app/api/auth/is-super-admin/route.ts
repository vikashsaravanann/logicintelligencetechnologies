import { NextResponse } from "next/server";
import { isRouteCallerSuperAdmin } from "@/lib/auth/is-super-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const isSuperAdmin = await isRouteCallerSuperAdmin();
  return NextResponse.json({ isSuperAdmin });
}
