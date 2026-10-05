import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { adaptCopy, aspectFor, mcpToolFor } from "@/lib/omni/adapt";
import type { OmniChannel, OmniPostCreate } from "@/lib/omni/types";

const ALLOWED: OmniChannel[] = [
  "instagram",
  "facebook",
  "linkedin",
  "x",
  "telegram",
  "threads",
  "discord",
  "website",
];

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("omni_posts")
    .select("id, root_text, media_master_url, status, channels, execute_at, schedule_mode, title, created_at")
    .order("execute_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("[omni/posts]", error);
    return NextResponse.json({ success: false, message: "Request failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true, posts: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: OmniPostCreate;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const root = (body.root_text || "").trim();
  const channels = (body.channels || []).filter((c): c is OmniChannel =>
    ALLOWED.includes(c as OmniChannel)
  );
  if (!root || channels.length === 0) {
    return NextResponse.json(
      { success: false, message: "root_text and at least one channel required" },
      { status: 400 }
    );
  }

  const executeAt = body.execute_at
    ? new Date(body.execute_at).toISOString()
    : new Date().toISOString();
  const scheduleMode = body.schedule_mode === "predictive" ? "predictive" : "manual";

  const { data: post, error: postErr } = await supabase
    .from("omni_posts")
    .insert({
      user_id: user.id,
      root_text: root,
      media_master_url: body.media_master_url ?? null,
      status: "queued",
      channels,
      execute_at: executeAt,
      schedule_mode: scheduleMode,
      title: body.title ?? null,
    })
    .select("id")
    .single();

  if (postErr || !post) {
    console.error("[omni/posts]", postErr);
    return NextResponse.json(
      { success: false, message: "Failed to create post" },
      { status: 500 }
    );
  }

  const variants = channels.map((channel) => ({
    post_id: post.id,
    channel,
    caption: adaptCopy(root, channel),
    hashtags: [] as string[],
    alt_text: (body.title || root).slice(0, 125),
    media_url: body.media_master_url ?? null,
    aspect_ratio: aspectFor(channel),
    payload: {},
  }));

  const { error: varErr } = await supabase.from("omni_post_variants").insert(variants);
  if (varErr) {
    console.error("[omni/posts]", varErr);
    return NextResponse.json({ success: false, message: "Request failed" }, { status: 500 });
  }

  const jobs = channels.map((channel) => ({
    post_id: post.id,
    channel,
    status: "pending",
    scheduled_for: executeAt,
    mcp_tool: mcpToolFor(channel),
    attempts: 0,
  }));

  const { error: jobErr } = await supabase.from("omni_publish_jobs").insert(jobs);
  if (jobErr) {
    console.error("[omni/posts]", jobErr);
    return NextResponse.json({ success: false, message: "Request failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    post_id: post.id,
    status: "queued",
    execute_at: executeAt,
    jobs_enqueued: jobs.length,
    variants: variants.map((v) => ({
      channel: v.channel,
      caption: v.caption,
      aspect_ratio: v.aspect_ratio,
    })),
  });
}

export const dynamic = "force-dynamic";
