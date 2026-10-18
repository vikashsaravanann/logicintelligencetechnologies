import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  listClientMessages,
  postStaffReplyMessage,
  type ClientChatMessage,
  type ConversationThreadResult,
} from "@/lib/client-portal/messages";

export type StaffInboxThread = {
  threadId: string;
  clientEmail: string;
  subject: string | null;
  engagementRef: string | null;
  projectTitle: string | null;
  updatedAt: string | null;
  lastPreview: string | null;
};

async function resolveStaffScope(staffUserId: string) {
  const emails = new Set<string>();
  const refs = new Set<string>();
  const titleByRef = new Map<string, string>();

  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("engagement_id, status, expires_at")
    .eq("staff_user_id", staffUserId)
    .eq("status", "active");

  const rows = (assignments || []).filter(
    (a) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now()
  );
  const engagementIds = rows.map((a) => a.engagement_id).filter(Boolean) as string[];

  if (engagementIds.length) {
    const { data: engs } = await supabaseAdmin
      .from("client_engagements")
      .select("id, engagement_ref, contact_email, project_title, company_name")
      .in("id", engagementIds);
    for (const e of engs || []) {
      if (e.engagement_ref) {
        refs.add(e.engagement_ref);
        titleByRef.set(
          e.engagement_ref,
          e.project_title || e.company_name || e.engagement_ref
        );
      }
      if (e.contact_email) emails.add(String(e.contact_email).toLowerCase());
    }
  }

  return { emails, refs, titleByRef };
}

export async function listStaffInbox(staffUserId: string): Promise<StaffInboxThread[]> {
  const scope = await resolveStaffScope(staffUserId);
  if (scope.emails.size === 0 && scope.refs.size === 0) {
    return [];
  }

  const { data: allThreads, error } = await supabaseAdmin
    .from("conversation_threads")
    .select("thread_id, client_email, subject, engagement_ref, updated_at, created_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(80);

  if (error) {
    console.error("[staff/messages] list threads:", error.message);
    return [];
  }

  const filtered = (allThreads || []).filter((t) => {
    const email = (t.client_email || "").toLowerCase();
    const ref = t.engagement_ref || "";
    return scope.emails.has(email) || (ref && scope.refs.has(ref));
  });

  const result: StaffInboxThread[] = [];
  for (const t of filtered) {
    const { data: last } = await supabaseAdmin
      .from("conversation_messages")
      .select("content")
      .eq("thread_id", t.thread_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    result.push({
      threadId: t.thread_id,
      clientEmail: t.client_email,
      subject: t.subject,
      engagementRef: t.engagement_ref,
      projectTitle:
        (t.engagement_ref && scope.titleByRef.get(t.engagement_ref)) || null,
      updatedAt: t.updated_at || t.created_at,
      lastPreview: last?.content?.slice(0, 120) || null,
    });
  }
  return result;
}

export async function getStaffThread(
  staffUserId: string,
  threadId: string
): Promise<ConversationThreadResult | null> {
  const scope = await resolveStaffScope(staffUserId);
  const { data: thread } = await supabaseAdmin
    .from("conversation_threads")
    .select("thread_id, client_email, engagement_ref")
    .eq("thread_id", threadId)
    .maybeSingle();

  if (!thread) return null;
  const email = (thread.client_email || "").toLowerCase();
  const ref = thread.engagement_ref || "";
  if (!scope.emails.has(email) && !(ref && scope.refs.has(ref))) return null;

  return listClientMessages(thread.client_email);
}

export async function staffReplyToThread(params: {
  staffUserId: string;
  staffEmail: string;
  staffName: string;
  staffRole?: string;
  threadId: string;
  content: string;
}): Promise<ClientChatMessage> {
  const thread = await getStaffThread(params.staffUserId, params.threadId);
  if (!thread) throw new Error("FORBIDDEN_OR_NOT_FOUND");

  const msg = await postStaffReplyMessage({
    clientEmail: thread.clientEmail,
    staffEmail: params.staffEmail,
    staffName: params.staffName,
    staffRole: params.staffRole,
    content: params.content,
  });

  await supabaseAdmin
    .from("conversation_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("thread_id", params.threadId);

  try {
    await supabaseAdmin.from("client_notifications").insert({
      client_email: thread.clientEmail.toLowerCase(),
      title: "New message from LIT team",
      message: params.content.slice(0, 200),
      category: "message",
      action_url: "/client/messages",
      action_label: "Open messages",
    });
  } catch (e: any) {
    console.warn("[staff/messages] client notification:", e?.message);
  }

  return msg;
}

export async function notifyStaffOfClientMessage(clientEmail: string, content: string) {
  const email = clientEmail.trim().toLowerCase();
  const { data: engs } = await supabaseAdmin
    .from("client_engagements")
    .select("id")
    .ilike("contact_email", email)
    .limit(10);

  const engIds = (engs || []).map((e) => e.id);
  if (!engIds.length) return;

  const { data: assigns } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("staff_user_id, engagement_id")
    .in("engagement_id", engIds)
    .eq("status", "active");

  const { notifyStaff } = await import("@/lib/staff/notifications");
  for (const a of assigns || []) {
    if (!a.staff_user_id) continue;
    const { data: ws } = await supabaseAdmin
      .from("staff_workspaces")
      .select("id")
      .eq("owner_user_id", a.staff_user_id)
      .maybeSingle();
    if (ws) {
      await supabaseAdmin.from("staff_workspace_events").insert({
        workspace_id: ws.id,
        actor_auth_id: a.staff_user_id,
        target_user_id: a.staff_user_id,
        event_key: "client.message.received",
        details: {
          client_email: email,
          engagement_id: a.engagement_id,
          preview: content.slice(0, 160),
        },
      });
    }
    await notifyStaff({
      recipientUserId: a.staff_user_id,
      engagementId: a.engagement_id || null,
      eventType: "client.message",
      title: "New client message",
      summary: content.slice(0, 160),
      sourceId: email,
      actionUrl: "/staff/messages",
      idempotencyKey: `msg:${a.staff_user_id}:${email}:${Date.now() // 60000}`,
    });
  }
}
