import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { AdminBackLink } from "../../components/AdminBackLink";
import { EmailNavTabs } from "../components/EmailNavTabs";
import { InspectEmailButton } from "../components/InspectEmailButton";
import { Inbox, Mail, Clock, Tag, Search, Filter } from "lucide-react";

export const metadata: Metadata = {
  title: "Outbox Queue | Emails | Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function getStatusBadge(statusRaw: string | null | undefined) {
  const status = (statusRaw || "queued").toLowerCase();

  if (status === "delivered" || status === "success" || status === "succeeded") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Delivered
      </span>
    );
  }
  if (status === "failed" || status === "error" || status === "dead-letter") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-rose-200 bg-rose-50 text-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Failed
      </span>
    );
  }
  if (status === "bounced" || status === "suppressed" || status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-rose-200 bg-rose-50 text-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Bounced
      </span>
    );
  }
  if (status === "sending" || status === "claimed" || status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        Sending
      </span>
    );
  }
  if (status === "retry") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Retry Scheduled
      </span>
    );
  }
  if (status === "unknown_acceptance") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-purple-200 bg-purple-50 text-purple-800">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Unknown Acceptance
      </span>
    );
  }
  // Default queued
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-800">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      Queued
    </span>
  );
}

function str(obj: any, ...keys: string[]): string {
  for (const key of keys) {
    if (obj[key] && typeof obj[key] === "string") return obj[key];
    if (obj.metadata?.[key] && typeof obj.metadata[key] === "string") return obj.metadata[key];
  }
  return "—";
}

function getTemplateTag(obj: any): string {
  if (obj.template_key && typeof obj.template_key === "string") return obj.template_key;
  if (obj.category && typeof obj.category === "string") return obj.category.toUpperCase();
  if (obj.metadata?.template) return String(obj.metadata.template);
  return "—";
}

function getSentAt(obj: any): string | null {
  if (obj.sent_at) return obj.sent_at;
  if (obj.updated_at && obj.status === "sent") return obj.updated_at;
  return obj.created_at;
}

export default async function OutboxPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  await requireCapabilityPage("emails.read", "/admin/emails/outbox");

  const page = parseInt(searchParams.page || "1", 10);
  const filterStatus = searchParams.status;
  const limit = 50;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin.from("email_outbox").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  
  if (filterStatus && filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data: outboxRows, count, error } = await query;
  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2">
        <AdminBackLink />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Outbox Queue
            </h1>
            <p className="mt-2 text-sm text-[var(--lit-text-muted,#52677C)]">
              Unified dispatch queue and intent ledger for all 4 environments.
            </p>
          </div>
        </div>
      </div>

      <EmailNavTabs />

      {error ? (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-800">
          Failed to load outbox: {error.message}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search recipient or subject..." 
                  className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white w-64 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
                <Filter className="w-4 h-4 text-slate-500" />
                <select className="text-sm border-none bg-transparent focus:outline-none">
                  <option value="all">All Statuses</option>
                  <option value="queued">Queued</option>
                  <option value="sending">Sending</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="bounced">Bounced</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-slate-500 font-medium">
              Showing {outboxRows?.length || 0} of {count || 0}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-5 py-3.5">Environment</th>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Template / Tag</th>
                  <th className="px-5 py-3.5">Sent At</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {(outboxRows || []).map((r, i) => {
                  const recipient = str(r, "recipient", "to_email", "to", "email");
                  const subject = str(r, "subject");
                  const templateTag = getTemplateTag(r);
                  const sentAt = getSentAt(r);
                  const statusRaw = (typeof r.status === "string" ? r.status : null) ?? "queued";
                  const entity = r.metadata?.entity || r.entity || "Corporate";

                  return (
                    <tr key={(r.id as string) ?? i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600">
                          {entity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-slate-100 text-slate-500">
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-mono text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                            {recipient}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[var(--lit-navy,#0B2545)] max-w-[240px]">
                        <span className="line-clamp-1 font-medium" title={subject}>
                          {subject}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {templateTag !== "—" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 font-mono text-[11px] font-medium text-[var(--lit-navy,#0B2545)]">
                            <Tag className="w-2.5 h-2.5 text-[var(--lit-text-muted,#52677C)]" />
                            {templateTag}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-[var(--lit-text-muted,#52677C)] whitespace-nowrap">
                        {sentAt ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatIST(sentAt, "datetime")}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {getStatusBadge(statusRaw)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <InspectEmailButton
                          email={{
                            id: String(r.id || `outbox-${i}`),
                            recipient,
                            sender: typeof r.sender === "string" ? r.sender : null,
                            replyTo: typeof r.reply_to === "string" ? r.reply_to : null,
                            subject,
                            status: statusRaw,
                            eventType: typeof r.event_type === "string" ? r.event_type : null,
                            templateKey: typeof r.template_key === "string" ? r.template_key : null,
                            html: typeof r.html === "string" ? r.html : null,
                            text: typeof r.text === "string" ? r.text : null,
                            sentAt,
                            createdAt: typeof r.created_at === "string" ? r.created_at : null,
                            providerMessageId: typeof r.provider_message_id === "string" ? r.provider_message_id : null,
                            lastError: typeof r.last_error === "string" ? r.last_error : null,
                            attemptCount: typeof r.attempt_count === "number" ? r.attempt_count : null,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
                {(outboxRows || []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--lit-text-muted,#52677C)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-[var(--lit-navy,#0B2545)]">No outbox entries found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
