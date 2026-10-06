import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../components/AdminBackLink";
import { OutreachClient } from "./OutreachClient";

export const metadata: Metadata = {
  title: "Outreach Pipeline | Admin Command Center",
  robots: { index: false, follow: false },
};

export default async function AdminOutreachPage() {
  await requireCapabilityPage("outreach.read", "/admin/outreach");
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <AdminBackLink />
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Client Outreach Pipeline
        </h1>
        <p className="text-sm text-neutral-400">
          Compliant campaigns with suppression, dry-run, human activation, and
          sequenced follow-ups. Marketing sends use the centralized email system.
        </p>
      </div>
      <OutreachClient />
    </div>
  );
}
