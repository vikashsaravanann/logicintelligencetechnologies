import "server-only";
import { NextRequest, NextResponse } from "next/server";
import {
  verifyCalComWebhookHmac,
  processCalComBookingWebhook,
  type CalComBookingPayload,
} from "@/lib/automations/enquiry-adapter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader =
      request.headers.get("x-cal-signature-256") ||
      request.headers.get("x-signature-256") ||
      request.headers.get("cal-signature");

    // 1. Verify signature if webhook secret is configured
    const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const isValid = verifyCalComWebhookHmac(rawBody, signatureHeader, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid webhook HMAC signature" },
          { status: 401 }
        );
      }
    }

    // 2. Parse JSON body
    let payload: CalComBookingPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON payload" },
        { status: 400 }
      );
    }

    if (!payload || !payload.triggerEvent || !payload.payload) {
      return NextResponse.json(
        { success: false, error: "Invalid Cal.com webhook structure" },
        { status: 400 }
      );
    }

    // 3. Process booking webhook idempotently
    const result = await processCalComBookingWebhook(payload);

    return NextResponse.json({
      success: result.success,
      bookingUid: result.bookingUid,
      isDuplicate: result.isDuplicate,
      actionTaken: result.actionTaken,
      threadId: result.threadId,
    });
  } catch (err) {
    console.error("[enquiry/webhook/calcom] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
