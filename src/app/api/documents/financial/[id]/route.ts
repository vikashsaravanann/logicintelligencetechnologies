import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DOCUMENTS_BUCKET } from "@/lib/documents/storage";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

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

  // Fetch document metadata
  const { data: doc, error: docError } = await supabaseAdmin
    .from("financial_documents")
    .select("id, document_number, title, storage_path, sha256_hash, byte_size, status")
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

  // Download raw PDF from storage bucket
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
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
