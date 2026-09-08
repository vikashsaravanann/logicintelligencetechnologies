import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import BackToHome from "@/components/ui/back-to-home";
import { env } from "@/config/env";
import { getUserPortalData } from "./actions/portal";
import { PortalTabs } from "./components/portal-tabs";
import { Building2, Mail, Phone } from "lucide-react";
import { COMPANY } from "@/config/company";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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
    <div className="min-h-screen bg-[#050814] text-white relative overflow-x-hidden grid justify-items-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 portal-shell pt-24 sm:pt-28 pb-20">
        <div className="mb-4">
          <BackToHome inline />
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-[24px] p-5 sm:p-8 mb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 bg-white shrink-0 mx-auto sm:mx-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || "Profile"}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-2xl font-black text-[#041018] bg-gradient-to-br from-cyan-300 to-sky-400">
                  {initial}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300 mb-1">
                {COMPANY.displayName.toUpperCase()} · CLIENT PORTAL
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">
                {fullName || "Your profile"}
              </h1>
              <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-4 text-[13px] text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400/80" />
                  {user.email}
                </span>
                {profileDetails.companyName ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400/80" />
                    {profileDetails.companyName}
                  </span>
                ) : null}
                {profileDetails.phoneNumber ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400/80" />
                    {profileDetails.phoneNumber}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
            {stats.map((s) => (
              <div
                key={s.k}
                className="rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-3 text-center min-h-[72px] flex flex-col items-center justify-center"
              >
                <p className="text-xl font-black tracking-tight">{s.v}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{s.k}</p>
              </div>
            ))}
          </div>
        </div>

        <PortalTabs portalData={portalData} profileDetails={profileDetails} />
      </div>
    </div>
  );
}
