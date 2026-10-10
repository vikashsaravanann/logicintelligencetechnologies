import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";
import BackButton from "@/components/navigation/back-button";
import { env } from "@/config/env";
import { getUserPortalData } from "./actions/portal";
import { PortalTabs } from "./components/portal-tabs";
import { Building2, Mail, Phone } from "lucide-react";
import { COMPANY } from "@/config/company";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerComponentClient(
    { cookies: () => cookieStore as any },
    {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  const portalData = (await getUserPortalData()) ?? {
    projects: [],
    invoices: [],
    supportTickets: [],
    clientFiles: [],
    onboarding: [],
    user: session.user,
  };

  const user = session.user;
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const fullName = profile?.full_name || user.user_metadata?.full_name || "";

  const profileDetails = {
    fullName,
    email: user.email || "",
    companyName: profile?.company_name || "",
    phoneNumber: profile?.phone_number || "",
  };

  const initial = (fullName?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase();

  const stats = [
    { k: "Projects", v: String(portalData.projects.length) },
    { k: "Invoices", v: String(portalData.invoices.length) },
    { k: "Tickets", v: String(portalData.supportTickets.length) },
    { k: "Files", v: String(portalData.clientFiles.length) },
  ];

  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] relative py-10 sm:py-16">
      {/* Subtle decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-b from-teal-500/5 to-transparent blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,37,69,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(11,37,69,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {notice === "admin-required" && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 shadow-xs"
          >
            <p className="font-semibold text-amber-950">This account cannot open the admin dashboard.</p>
            <p className="mt-1 text-amber-900/90 leading-relaxed">
              {session.user.email} is signed in, but its role is{" "}
              <strong className="text-amber-950 font-bold">{profile?.role || "not set"}</strong>. The admin dashboard needs the role{" "}
              <strong className="text-amber-950 font-bold">admin</strong> or <strong className="text-amber-950 font-bold">super_admin</strong>, which only a database
              administrator can assign in Supabase.
            </p>
          </div>
        )}

        <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-7">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[var(--lit-border-light,#DFE7EF)] bg-white shrink-0 mx-auto sm:mx-0 relative shadow-xs">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName || "Profile"}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-[var(--lit-navy,#0B2545)] to-[var(--lit-blue,#1565C0)]">
                  {initial}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] text-[11px] font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-teal,#1FA9A2)]" />
                {COMPANY.displayName} · Client Portal
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] break-words">
                {fullName || "Client Workspace"}
              </h1>
              <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm text-[var(--lit-text-muted,#52677C)]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                  <Mail className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                  {user.email}
                </span>
                {profileDetails.companyName ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                    <Building2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                    {profileDetails.companyName}
                  </span>
                ) : null}
                {profileDetails.phoneNumber ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                    <Phone className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                    {profileDetails.phoneNumber}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)]">
            {stats.map((s) => (
              <div
                key={s.k}
                className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-4 py-3.5 text-center flex flex-col items-center justify-center"
              >
                <p className="text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)] tracking-tight">{s.v}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mt-1">{s.k}</p>
              </div>
            ))}
          </div>
        </div>

        <PortalTabs portalData={portalData} profileDetails={profileDetails} />
      </div>
    </div>
  );
}
