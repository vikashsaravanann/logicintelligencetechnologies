import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DOCUMENTS_BUCKET } from "@/lib/documents/storage";
import { resolveClientIdentity } from "@/lib/auth/client-identity";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid document identifier" },
      { status: 400 }
    );
  }

  // 1. Enforce authenticated session
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json(
      { error: "Authentication required to access financial documents" },
      { status: 401 }
    );
  }

  // 2. Fetch document metadata
  const { data: doc, error: docError } = await supabaseAdmin
    .from("financial_documents")
    .select("id, document_number, title, storage_path, sha256_hash, byte_size, status, client_id, payment_request_id")
    .eq("id", id)
    .maybeSingle();

  if (docError || !doc) {
    return NextResponse.json(
      { error: "Financial document not found" },
      { status: 404 }
    );
  }

  if (doc.status !== "issued") {
    return NextResponse.json(
      { error: "Document is void or revoked" },
      { status: 410 }
    );
  }

  // 3. Verify authorization: caller must be super_admin/admin, staff assigned, or document owner
  const clientContext = await resolveClientIdentity(user.id);
  const isStaffAdmin = clientContext.role === "super_admin" || clientContext.role === "staff";

  const isDirectOwner = Boolean(
    (clientContext.clientId && (doc.client_id === clientContext.clientId || doc.client_id === user.id)) ||
    doc.client_id === user.id
  );

  if (!isStaffAdmin && !isDirectOwner) {
    let isPaymentOwner = false;
    if (doc.payment_request_id) {
      const { data: pr } = await supabaseAdmin
        .from("engagement_payment_requests")
        .select("client_id")
        .eq("id", doc.payment_request_id)
        .maybeSingle();
      if (
        pr &&
        ((clientContext.clientId && pr.client_id === clientContext.clientId) ||
          pr.client_id === user.id)
      ) {
        isPaymentOwner = true;
      }
    }

    if (!isPaymentOwner) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view this document" },
        { status: 403 }
      );
    }
  }

  // 4. Download raw PDF from secure storage bucket
  const { data: blob, error: downloadError } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .download(doc.storage_path);

  if (downloadError || !blob) {
    return NextResponse.json(
      { error: "Document file could not be retrieved from secure storage" },
      { status: 500 }
    );
  }

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${doc.document_number}.pdf"`,
      "Content-Length": buffer.length.toString(),
      "X-Content-Sha256": doc.sha256_hash,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
