import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import {
  EMAIL_TEMPLATE_REGISTRY,
  renderTemplatePreview,
} from "@/lib/email/template-registry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    const list = Object.values(EMAIL_TEMPLATE_REGISTRY).map((t) => ({
      key: t.key,
      name: t.name,
      category: t.category,
      description: t.description,
      subject: t.subject,
      defaultSender: t.defaultSender,
      replyTo: t.replyTo,
    }));
    return NextResponse.json({ ok: true, count: list.length, templates: list });
  }

  try {
    const preview = await renderTemplatePreview(key);
    return NextResponse.json({ ok: true, preview });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to render preview";
    return NextResponse.json({ ok: false, message }, { status: 404 });
  }
}
