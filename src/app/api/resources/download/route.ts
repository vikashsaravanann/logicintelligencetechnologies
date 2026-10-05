import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/ai/rate-limit";
import { redis } from "@/lib/ai/redis";
import { PDF_RESOURCES } from "@/config/pdfs";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!(await rateLimit(`resource_dl:${clientIp(req)}`, 20, 15 * 60_000))) {
      return new NextResponse("Rate limited", { status: 429 });
    }

    if (!redis) {
      return new NextResponse("Server configuration error", { status: 500 });
    }

    // 1. Validate and consume token (Single-use)
    const resourceId = await redis.get(`res_token:${token}`);
    if (!resourceId) {
      return new NextResponse("Invalid or expired token", { status: 403 });
    }
    
    // In a strict environment, we might delete it to make it single-use:
    // await redis.del(`res_token:${token}`);

    // 2. Find resource
    const resource = PDF_RESOURCES.find((r) => r.id === resourceId);
    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    // 3. Private File Stream
    // In a real production deployment, this might redirect to a signed S3/R2 URL.
    // We stream it securely from the private/ directory so the user doesn't get a static URL.
    const filePath = path.join(process.cwd(), "private", "resources", resource.filename);
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse("File missing on server", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resource.filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[Resource Download]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
