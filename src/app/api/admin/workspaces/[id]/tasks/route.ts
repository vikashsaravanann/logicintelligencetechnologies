import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getCallerUser() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user || user.is_anonymous) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? "", role: profile?.role || "user" };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: workspaceId } = await params;

  // Check workspace ownership
  const { data: ws } = await supabaseAdmin
    .from("staff_workspaces")
    .select("owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  if (ws.owner_user_id !== caller.userId && caller.role !== "super_admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { data: tasks, error } = await supabaseAdmin
    .from("staff_tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: tasks || [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: workspaceId } = await params;

  const { data: ws } = await supabaseAdmin
    .from("staff_workspaces")
    .select("owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  if (ws.owner_user_id !== caller.userId && caller.role !== "super_admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: {
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    dueAt?: string | null;
    projectId?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ error: "Task title is required" }, { status: 400 });
  }

  const { data: task, error } = await supabaseAdmin
    .from("staff_tasks")
    .insert({
      workspace_id: workspaceId,
      assignee_user_id: ws.owner_user_id,
      title: body.title.trim(),
      description_safe: body.description?.trim() || null,
      priority: body.priority || "medium",
      due_at: body.dueAt || null,
      project_id: body.projectId || null,
      state: "todo",
      created_by: caller.userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: workspaceId } = await params;

  const { data: ws } = await supabaseAdmin
    .from("staff_workspaces")
    .select("owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  if (ws.owner_user_id !== caller.userId && caller.role !== "super_admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: {
    taskId?: string;
    state?: "todo" | "in_progress" | "review" | "completed" | "blocked" | "cancelled";
    priority?: "low" | "medium" | "high" | "urgent";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (body.state) updates.state = body.state;
  if (body.priority) updates.priority = body.priority;

  const { data: task, error } = await supabaseAdmin
    .from("staff_tasks")
    .update(updates)
    .eq("id", body.taskId)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task });
}
