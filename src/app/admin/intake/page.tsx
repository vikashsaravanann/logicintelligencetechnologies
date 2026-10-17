import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import Link from "next/link";
import { AdminBackLink } from "../components/AdminBackLink";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";
import { formatIST } from "@/lib/format/datetime";
import {
  Inbox,
  Filter,
  Search,
  CalendarDays,
  Mail,
  Building2,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Activity,
  FileSpreadsheet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Universal Four-Site Intake Inbox | Admin | Logic Intelligence Technologies",
  description: "Unified cross-site form submissions, commercial inquiries, consultation bookings, and delivery telemetry.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

interface IntakeItem {
  id: string;
  reference: string;
  entity: "corporate" | "healthcare" | "logicvoice" | "voiceshield";
  type: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  companyName?: string | null;
  details: string;
  submittedAt: string;
  status: string;
  notificationState: string;
}

export default async function AdminIntakePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; status?: string }>;
}) {
  await requireCapabilityPage("leads.read", "/admin/intake");

  const params = await searchParams;
  const currentTab = params.tab || "all";
  const searchQuery = (params.q || "").toLowerCase().trim();
  const statusFilter = params.status || "all";

  const allItems: IntakeItem[] = [];

  if (isSupabaseLive()) {
    try {
      // 1. Fetch Corporate Bookings
      const { data: bookings } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (bookings) {
        for (const b of bookings) {
          allItems.push({
            id: `b_${b.id}`,
            reference: `LIT-BKG-${b.id.substring(0, 8).toUpperCase()}`,
            entity: "corporate",
            type: "Consultation Booking",
            customerName: b.name,
            customerEmail: b.email,
            customerPhone: b.phone,
            companyName: b.company,
            details: `Slot: ${b.slot_time} (${b.timezone || "Asia/Kolkata"}) · Type: ${b.consultation_type}`,
            submittedAt: b.created_at,
            status: b.status || "received",
            notificationState: "sent",
          });
        }
      }

      // 2. Fetch Corporate Contact Leads
      const { data: leads } = await supabaseAdmin
        .from("contact_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (leads) {
        for (const l of leads) {
          allItems.push({
            id: `l_${l.id}`,
            reference: `LIT-LEAD-${l.id.substring(0, 8).toUpperCase()}`,
            entity: "corporate",
            type: "Contact Lead",
            customerName: l.name,
            customerEmail: l.email,
            customerPhone: l.phone,
            companyName: l.company,
            details: `Project: ${l.project_type || "General"} · Budget: ${l.budget || "N/A"}`,
            submittedAt: l.created_at,
            status: l.status || "new",
            notificationState: "sent",
          });
        }
      }

      // 3. Fetch Cross-Site Intake Events
      const { data: events } = await supabaseAdmin
        .from("intake_events")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(100);

      if (events) {
        for (const e of events) {
          allItems.push({
            id: `e_${e.id}`,
            reference: e.source_record_id || `EVT-${e.id.substring(0, 8).toUpperCase()}`,
            entity: e.entity as any,
            type: e.record_type,
            customerName: e.customer_name || "Valued Customer",
            customerEmail: e.customer_email,
            customerPhone: e.customer_phone,
            companyName: e.company_name,
            details: `Source: ${e.source_site} (${e.form_id})`,
            submittedAt: e.submitted_at,
            status: "received",
            notificationState: e.notification_state || "queued",
          });
        }
      }

      // 4. Fetch Checklist & Discovery Questionnaire Leads
      const { data: checklistLeads } = await supabaseAdmin
        .from("checklist_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (checklistLeads) {
        for (const c of checklistLeads) {
          const ansCount = Array.isArray(c.answers) ? c.answers.length : 0;
          allItems.push({
            id: `chk_${c.id}`,
            reference: `LIT-CHK-${c.id.substring(0, 8).toUpperCase()}`,
            entity: "corporate",
            type: ansCount > 0 ? "Discovery Questionnaire" : "Checklist Download",
            customerName: c.name,
            customerEmail: c.email,
            customerPhone: null,
            companyName: c.company || "Direct Lead",
            details: ansCount > 0 ? `${ansCount} discovery answers recorded · Role: ${c.role || "N/A"}` : `Checklist resource lead · Role: ${c.role || "N/A"}`,
            submittedAt: c.created_at,
            status: "received",
            notificationState: "sent",
          });
        }
      }

      // 5. Fetch Free Demo Leads
      const { data: demoLeads } = await supabaseAdmin
        .from("demo_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (demoLeads) {
        for (const d of demoLeads) {
          allItems.push({
            id: `demo_${d.id}`,
            reference: `LIT-DEMO-${d.id.substring(0, 8).toUpperCase()}`,
            entity: "corporate",
            type: "Free Demo Request",
            customerName: d.name,
            customerEmail: d.email,
            customerPhone: d.phone || null,
            companyName: d.company || "Demo Prospect",
            details: `Product / Service: ${d.product || "General"} · Notes: ${d.notes || "None"}`,
            submittedAt: d.created_at,
            status: d.status || "new",
            notificationState: "sent",
          });
        }
      }
    } catch (err) {
      console.error("[Admin Intake Query Error]", err);
    }
  }

  // Sort unified items descending by submission time
  allItems.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Filter by Tab
  const filteredByTab = allItems.filter((item) => {
    if (currentTab === "all") return true;
    if (currentTab === "corporate") return item.entity === "corporate";
    if (currentTab === "healthcare") return item.entity === "healthcare";
    if (currentTab === "logicvoice") return item.entity === "logicvoice";
    if (currentTab === "voiceshield") return item.entity === "voiceshield";
    if (currentTab === "bookings") return item.type.includes("Consultation");
    if (currentTab === "leads") return item.type.includes("Lead") || item.type.includes("Contact");
    if (currentTab === "checklist") return item.type.includes("Checklist") || item.type.includes("Discovery");
    if (currentTab === "demo") return item.type.includes("Demo");
    return true;
  });

  // Filter by Search Query & Status
  const displayedItems = filteredByTab.filter((item) => {
    if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (!searchQuery) return true;
    return (
      item.reference.toLowerCase().includes(searchQuery) ||
      item.customerName.toLowerCase().includes(searchQuery) ||
      item.customerEmail.toLowerCase().includes(searchQuery) ||
      (item.companyName || "").toLowerCase().includes(searchQuery)
    );
  });

  const totalCount = allItems.length;
  const corporateCount = allItems.filter((i) => i.entity === "corporate").length;
  const healthcareCount = allItems.filter((i) => i.entity === "healthcare").length;
  const logicVoiceCount = allItems.filter((i) => i.entity === "logicvoice").length;
  const voiceShieldCount = allItems.filter((i) => i.entity === "voiceshield").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Inbox className="w-3 h-3" />
              Unified Inbox
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              4-Site Operations Feed
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Universal Form Intake & Inquiries
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time multi-site lead ledger, commercial consultations, support tickets, and email telemetry across LIT ecosystem.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
            <Layers className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">Total Records</p>
              <p className="text-base font-bold text-[var(--lit-navy,#0B2545)]">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
        {[
          { id: "all", label: "All Records", count: totalCount },
          { id: "corporate", label: "Corporate LIT", count: corporateCount },
          { id: "healthcare", label: "LIT Healthcare", count: healthcareCount },
          { id: "logicvoice", label: "Logic Voice", count: logicVoiceCount },
          { id: "voiceshield", label: "VoiceShield", count: voiceShieldCount },
          { id: "bookings", label: "Consultation Bookings", count: allItems.filter((i) => i.type.includes("Consultation")).length },
          { id: "leads", label: "Contact Inquiries", count: allItems.filter((i) => i.type.includes("Lead") || i.type.includes("Contact")).length },
          { id: "checklist", label: "Checklists & Discovery", count: allItems.filter((i) => i.type.includes("Checklist") || i.type.includes("Discovery")).length },
          { id: "demo", label: "Free Demos", count: allItems.filter((i) => i.type.includes("Demo")).length },
        ].map((tab) => {
          const active = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/intake?tab=${tab.id}`}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                  : "bg-white text-[var(--lit-text-muted,#52677C)] border border-[var(--lit-border-light,#DFE7EF)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Submissions Feed Table */}
      <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--lit-border-light,#DFE7EF)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
            <Activity className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Audited Intake Records ({displayedItems.length})</span>
          </div>
          <div className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Verified recipient: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">admin@logicintelligencetechnologies.in</code>
          </div>
        </div>

        {displayedItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--lit-text-muted,#52677C)]">
            No intake records found matching current criteria. Submissions across Corporate, Healthcare, Logic Voice, and VoiceShield will stream here in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--lit-cloud,#F7F9FC)] border-b border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Site / Origin</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type & Details</th>
                  <th className="py-3 px-4">Submitted (IST)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {displayedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--lit-cloud,#F7F9FC)]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--lit-navy,#0B2545)] whitespace-nowrap">
                      {item.reference}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                          item.entity === "corporate"
                            ? "border-blue-200 bg-blue-50 text-blue-800"
                            : item.entity === "healthcare"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : item.entity === "logicvoice"
                            ? "border-purple-200 bg-purple-50 text-purple-800"
                            : "border-teal-200 bg-teal-50 text-teal-800"
                        }`}
                      >
                        {item.entity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{item.customerName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{item.customerEmail}</div>
                      {item.companyName && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.companyName}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800">{item.type}</div>
                      <div className="text-slate-500 truncate text-[11px] mt-0.5">{item.details}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                      {formatIST(item.submittedAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-amber-200 bg-amber-50 text-amber-800 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-200 bg-emerald-50 text-emerald-800 font-mono">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {item.notificationState}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
