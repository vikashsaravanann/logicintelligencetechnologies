import { Metadata } from "next";
import { BroadcastForm } from "./broadcast-form";

export const metadata: Metadata = {
  title: "Compose Message | Admin",
};

export default function NewEmailPage() {
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-black text-white mb-2">Compose message</h1>
      <p className="text-zinc-400 mb-8">
        Single-recipient transactional email via SMTP outbox. Not a mass-marketing
        blast.
      </p>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
        <BroadcastForm />
      </div>
    </div>
  );
}
