import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedClientUser } from "@/lib/auth/client-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export interface SearchResultItem {
  id: string;
  category: "engagement" | "project" | "approval" | "rfc" | "decision" | "document" | "invoice" | "ticket" | "meeting";
  title: string;
  snippet?: string;
  link: string;
  statusBadge?: string;
}

export async function GET(req: NextRequest) {
  try {
    const client = await getVerifiedClientUser();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Unauthorized client session" },
        { status: 401 }
      );
    }

    const { email, user } = client;
    const userId = user.id;
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        query,
        results: [],
        totalCount: 0,
      });
    }

    const results: SearchResultItem[] = [];

    // 1. Search Engagements
    try {
      const { data: engagements } = await supabaseAdmin
        .from("client_engagements")
        .select("id, engagement_ref, project_title, company_name, current_stage")
        .ilike("client_email", email);

      if (Array.isArray(engagements)) {
        for (const eng of engagements) {
          const matchTitle = (eng.project_title || "").toLowerCase().includes(query);
          const matchRef = (eng.engagement_ref || "").toLowerCase().includes(query);
          const matchCompany = (eng.company_name || "").toLowerCase().includes(query);
          if (matchTitle || matchRef || matchCompany) {
            results.push({
              id: eng.id,
              category: "engagement",
              title: `${eng.project_title || "Project"} (${eng.engagement_ref})`,
              snippet: `Stage ${eng.current_stage || 1} · ${eng.company_name || ""}`,
              link: `/engagement/${eng.engagement_ref}`,
              statusBadge: `Stage ${eng.current_stage || 1}`,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Search engagement query error:", e);
    }

    // 2. Search Assigned Projects & Sprints
    try {
      let projectQuery = supabaseAdmin
        .from("projects")
        .select("id, project_code, name, client_name, status, progress, due_date");

      if (userId) {
        projectQuery = projectQuery.eq("user_id", userId);
      } else {
        projectQuery = projectQuery.ilike("client_name", `%${email}%`);
      }

      const { data: projects } = await projectQuery;
      if (Array.isArray(projects)) {
        for (const p of projects) {
          const matchName = (p.name || "").toLowerCase().includes(query);
          const matchCode = (p.project_code || "").toLowerCase().includes(query);
          const matchStatus = (p.status || "").toLowerCase().includes(query);
          if (matchName || matchCode || matchStatus) {
            results.push({
              id: p.id,
              category: "project",
              title: `${p.name} (${p.project_code || "PRJ"})`,
              snippet: `Sprint progress: ${p.progress ?? 0}% · Target: ${p.due_date || "Continuous"}`,
              link: `/client/projects/${p.id}`,
              statusBadge: p.status || "In Progress",
            });
          }
        }
      }
    } catch (e) {
      console.warn("Search projects query error:", e);
    }

    // 3. Search Action Items / Approvals
    try {
      const { data: actions } = await supabaseAdmin
        .from("client_action_items")
        .select("id, title, description, category, status, action_url, engagement_ref")
        .ilike("client_email", email);

      if (Array.isArray(actions)) {
        for (const act of actions) {
          const matchTitle = (act.title || "").toLowerCase().includes(query);
          const matchDesc = (act.description || "").toLowerCase().includes(query);
          if (matchTitle || matchDesc) {
            results.push({
              id: act.id,
              category: "approval",
              title: act.title,
              snippet: act.description || `Task category: ${act.category}`,
              link: act.action_url || "/client/actions",
              statusBadge: act.status,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Search action items query error:", e);
    }

    // 4. Search Change Requests (RFCs)
    try {
      const { data: rfcs } = await supabaseAdmin
        .from("client_change_requests")
        .select("id, rfc_ref, title, description, status")
        .ilike("client_email", email);

      if (Array.isArray(rfcs)) {
        for (const rfc of rfcs) {
          const matchTitle = (rfc.title || "").toLowerCase().includes(query);
          const matchRef = (rfc.rfc_ref || "").toLowerCase().includes(query);
          const matchDesc = (rfc.description || "").toLowerCase().includes(query);
          if (matchTitle || matchRef || matchDesc) {
            results.push({
              id: rfc.id,
              category: "rfc",
              title: `${rfc.rfc_ref}: ${rfc.title}`,
              snippet: rfc.description,
              link: "/client/change-requests",
              statusBadge: rfc.status,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Search RFCs query error:", e);
    }

    // 5. Search Shared Decisions
    try {
      const { data: decisions } = await supabaseAdmin
        .from("client_shared_decisions")
        .select("id, title, decision_text, status")
        .ilike("client_email", email);

      if (Array.isArray(decisions)) {
        for (const dec of decisions) {
          const matchTitle = (dec.title || "").toLowerCase().includes(query);
          const matchText = (dec.decision_text || "").toLowerCase().includes(query);
          if (matchTitle || matchText) {
            results.push({
              id: dec.id,
              category: "decision",
              title: dec.title,
              snippet: dec.decision_text,
              link: "/client/actions",
              statusBadge: dec.status,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Search decisions query error:", e);
    }

    // 6. Search Document Vault (client_files)
    try {
      if (userId) {
        const { data: files } = await supabaseAdmin
          .from("client_files")
          .select("id, file_name, file_path, size, created_at")
          .eq("user_id", userId);

        if (Array.isArray(files)) {
          for (const f of files) {
            const matchName = (f.file_name || "").toLowerCase().includes(query);
            const matchPath = (f.file_path || "").toLowerCase().includes(query);
            if (matchName || matchPath) {
              const sizeKb = (Number(f.size || 0) / 1024).toFixed(1);
              results.push({
                id: f.id,
                category: "document",
                title: f.file_name,
                snippet: `Encrypted Document Vault · ${sizeKb} KB`,
                link: "/client/documents",
                statusBadge: "AES-256",
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Search document vault query error:", e);
    }

    // 7. Search Invoices & Billing Records
    try {
      let invQuery = supabaseAdmin
        .from("invoices")
        .select("id, invoice_code, client_name, amount, status, due_date");

      if (userId) {
        invQuery = invQuery.eq("user_id", userId);
      } else {
        invQuery = invQuery.ilike("client_name", `%${email}%`);
      }

      const { data: invList } = await invQuery;
      if (Array.isArray(invList)) {
        for (const inv of invList) {
          const matchCode = (inv.invoice_code || "").toLowerCase().includes(query);
          const matchStatus = (inv.status || "").toLowerCase().includes(query);
          if (matchCode || matchStatus) {
            results.push({
              id: inv.id,
              category: "invoice",
              title: `Invoice ${inv.invoice_code || inv.id.slice(0, 8)}`,
              snippet: `Amount: ₹${Number(inv.amount || 0).toLocaleString("en-IN")} · Due: ${inv.due_date || "Due on receipt"}`,
              link: "/client/invoices",
              statusBadge: inv.status || "Pending",
            });
          }
        }
      }
    } catch (e) {
      console.warn("Search invoices query error:", e);
    }

    // 8. Search Support Tickets
    try {
      if (userId) {
        const { data: tickets } = await supabaseAdmin
          .from("support_tickets")
          .select("id, subject, message, status, created_at")
          .eq("user_id", userId);

        if (Array.isArray(tickets)) {
          for (const t of tickets) {
            const matchSub = (t.subject || "").toLowerCase().includes(query);
            const matchMsg = (t.message || "").toLowerCase().includes(query);
            if (matchSub || matchMsg) {
              results.push({
                id: t.id,
                category: "ticket",
                title: t.subject,
                snippet: t.message || "Support incident ticket",
                link: `/support/${t.id}`,
                statusBadge: t.status || "Open",
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Search support tickets query error:", e);
    }

    // 9. Search Bookings / Meetings
    try {
      const { data: bookings } = await supabaseAdmin
        .from("bookings")
        .select("id, consultation_type, slot_time, notes, status")
        .ilike("email", email);

      if (Array.isArray(bookings)) {
        for (const b of bookings) {
          const matchType = (b.consultation_type || "").toLowerCase().includes(query);
          const matchNotes = (b.notes || "").toLowerCase().includes(query);
          if (matchType || matchNotes) {
            results.push({
              id: b.id,
              category: "meeting",
              title: b.consultation_type,
              snippet: `${b.slot_time}${b.notes ? ` · ${b.notes}` : ""}`,
              link: "/client/meetings",
              statusBadge: b.status,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Search bookings query error:", e);
    }

    return NextResponse.json({
      success: true,
      query,
      results,
      totalCount: results.length,
    });
  } catch (error: any) {
    console.error("Client search API exception:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Search failed" },
      { status: 500 }
    );
  }
}
