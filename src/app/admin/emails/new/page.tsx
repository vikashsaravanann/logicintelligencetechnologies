import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { BroadcastForm } from "./broadcast-form";
import { AdminTriggers } from "../../components/AdminTriggers";

export const metadata: Metadata = {
  title: "Compose Message | Admin",
};

export default async function NewEmailPage() {
  await requireCapabilityPage("emails.send", "/admin/emails/new");
  return (
    <div className="container mx-auto p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Compose message</h1>
        <p className="text-zinc-400">
          Single-recipient transactional email via SMTP outbox. Not a mass-marketing blast.
        </p>
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
        <BroadcastForm />
      </div>
      <AdminTriggers />
    </div>
  );
}
