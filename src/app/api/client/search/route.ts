import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolveClientEmail(req: NextRequest): Promise<string | null> {
  const headerEmail = req.headers.get("x-client-email");
  if (headerEmail && headerEmail.includes("@")) {
    return headerEmail.trim().toLowerCase();
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );
    const { data } = await supabase.auth.getUser();
    return data.user?.email?.trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

export interface SearchResultItem {
  id: string;
  category: "engagement" | "approval" | "rfc" | "decision" | "invoice" | "ticket" | "meeting";
  title: string;
  snippet?: string;
  link: string;
  statusBadge?: string;
}

export async function GET(req: NextRequest) {
  try {
    const email = await resolveClientEmail(req);
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized client session" },
        { status: 401 }
      );
    }

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

    // 2. Search Action Items / Approvals
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

    // 3. Search Change Requests (RFCs)
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

    // 4. Search Shared Decisions
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

    // 5. Search Bookings / Meetings
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
