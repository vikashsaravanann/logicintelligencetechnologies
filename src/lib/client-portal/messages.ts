import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export interface ClientChatMessage {
  id: string;
  sender: "team" | "client" | "system";
  senderName: string;
  role?: string;
  content: string;
  timestamp: string;
  status: "sending" | "sent" | "delivered" | "read";
}

export interface ConversationThreadResult {
  threadId: string;
  clientEmail: string;
  messages: ClientChatMessage[];
}

/**
 * Ensures a conversation thread exists for the client email.
 */
export async function getOrCreateThread(
  clientEmail: string,
  engagementRef?: string
): Promise<string> {
  const normalizedEmail = clientEmail.trim().toLowerCase();

  // Try finding existing thread
  const { data: existing } = await supabaseAdmin
    .from("conversation_threads")
    .select("thread_id")
    .eq("client_email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.thread_id) {
    return existing.thread_id;
  }

  // Create new thread
  const threadId = `th_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const { error: insertError } = await supabaseAdmin
    .from("conversation_threads")
    .insert([
      {
        thread_id: threadId,
        client_email: normalizedEmail,
        engagement_ref: engagementRef || null,
        subject: "Engineering Communications",
        status: "active",
      },
    ]);

  if (insertError) {
    console.error("[conversations] Failed to create thread:", insertError);
    // Return threadId anyway as fallback identifier
    return threadId;
  }

  // Seed authentic initial channel greeting (truthful - no fake automated replies)
  const initialMsgId = `msg_init_${Date.now().toString(36)}`;
  await supabaseAdmin.from("conversation_messages").insert([
    {
      message_id: initialMsgId,
      thread_id: threadId,
      sender_type: "team",
      sender_email: "dispatch@logicintelligencetechnologies.in",
      sender_name: "LIT Engineering Dispatch",
      role: "Solutions Architecture",
      content:
        "Welcome to your dedicated client workspace communications channel. This asynchronous stream connects you directly with your assigned engineering and architectural leads. Milestone progress, deliverables, and architecture blueprints are tracked across your workspace tabs. Please leave any project requirements, technical questions, or sprint review notes here.",
      status: "sent",
    },
  ]);

  return threadId;
}

/**
 * Lists all messages for a client's conversation thread.
 */
export async function listClientMessages(
  clientEmail: string
): Promise<ConversationThreadResult> {
  const threadId = await getOrCreateThread(clientEmail);

  const { data: rows, error } = await supabaseAdmin
    .from("conversation_messages")
    .select("message_id, sender_type, sender_name, role, content, status, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error || !rows) {
    console.warn("[conversations] Error fetching messages:", error?.message);
    return {
      threadId,
      clientEmail,
      messages: [],
    };
  }

  const messages: ClientChatMessage[] = rows.map((r) => ({
    id: r.message_id,
    sender: r.sender_type as "team" | "client" | "system",
    senderName: r.sender_name || (r.sender_type === "team" ? "LIT Engineering" : clientEmail),
    role: r.role || undefined,
    content: r.content,
    timestamp: r.created_at ? formatIST(r.created_at, "datetime") : "Recently",
    status: (r.status as ClientChatMessage["status"]) || "sent",
  }));

  return {
    threadId,
    clientEmail,
    messages,
  };
}

/**
 * Appends a new message from the client to the conversation thread.
 */
export async function postClientMessage(
  clientEmail: string,
  content: string,
  senderName?: string
): Promise<ClientChatMessage> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  const threadId = await getOrCreateThread(normalizedEmail);
  const messageId = `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date();

  const { error } = await supabaseAdmin.from("conversation_messages").insert([
    {
      message_id: messageId,
      thread_id: threadId,
      sender_type: "client",
      sender_email: normalizedEmail,
      sender_name: senderName || normalizedEmail,
      role: "Client Representative",
      content: content.trim(),
      status: "sent",
    },
  ]);

  if (error) {
    console.error("[conversations] Failed to insert message:", error);
    throw new Error(`Failed to store message: ${error.message}`);
  }

  return {
    id: messageId,
    sender: "client",
    senderName: senderName || normalizedEmail,
    role: "Client Representative",
    content: content.trim(),
    timestamp: formatIST(now.toISOString(), "datetime"),
    status: "sent",
  };
}

/**
 * Appends a new message from assigned staff/team to the conversation thread.
 */
export async function postStaffReplyMessage(params: {
  clientEmail: string;
  staffEmail: string;
  staffName: string;
  staffRole?: string;
  content: string;
}): Promise<ClientChatMessage> {
  const normalizedEmail = params.clientEmail.trim().toLowerCase();
  const threadId = await getOrCreateThread(normalizedEmail);
  const messageId = `msg_staff_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date();

  const { error } = await supabaseAdmin.from("conversation_messages").insert([
    {
      message_id: messageId,
      thread_id: threadId,
      sender_type: "team",
      sender_email: params.staffEmail,
      sender_name: params.staffName,
      role: params.staffRole || "Solutions Architecture",
      content: params.content.trim(),
      status: "sent",
    },
  ]);

  if (error) {
    console.error("[conversations] Failed to insert staff message:", error);
    throw new Error(`Failed to store staff message: ${error.message}`);
  }

  return {
    id: messageId,
    sender: "team",
    senderName: params.staffName,
    role: params.staffRole || "Solutions Architecture",
    content: params.content.trim(),
    timestamp: formatIST(now.toISOString(), "datetime"),
    status: "sent",
  };
}
