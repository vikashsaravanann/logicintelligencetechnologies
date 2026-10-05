import { NextResponse } from "next/server";
import fs from "fs";
import { getPdfResourceBySlug } from "@/config/pdfs";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import {
  resolveResourcePdfPath,
  verifyResourceAccessToken,
} from "@/lib/resources/access-token";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    if (!rateLimit(`resource-dl:${clientIp(req)}`, 30, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { slug: rawSlug } = await ctx.params;
    const slug = String(rawSlug || "").trim().toLowerCase();
    const resource = getPdfResourceBySlug(slug);
    if (!resource) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";

    // Default gated when accessType unset
    if (resource.accessType !== "public") {
      const verified = verifyResourceAccessToken(token, resource.slug);
      if (!verified.ok) {
        const status =
          verified.reason === "expired" || verified.reason === "mismatch"
            ? 403
            : 401;
        return NextResponse.json(
          { error: "Access denied. Request a new download link." },
          { status }
        );
      }
    }

    const filePath = resolveResourcePdfPath(resource.filename);
    if (!filePath) {
      console.error("[resource-download] missing file", resource.filename);
      return NextResponse.json({ error: "Resource unavailable" }, { status: 404 });
    }

    const data = fs.readFileSync(filePath);
    console.info("[resource-download] ok", resource.slug);

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resource.filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[resource-download]", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
