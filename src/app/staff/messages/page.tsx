import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { listStaffInbox } from "@/lib/staff/messages";
import { StaffMessagesClient } from "./StaffMessagesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages | LIT Staff Portal" };

export default async function StaffMessagesPage() {
  const ctx = await requireStaffPortal("/staff/messages");
  const threads = await listStaffInbox(ctx.userId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Project conversations for clients assigned to your workspace. Replies appear in the Client Portal.
        </p>
      </div>
      <StaffMessagesClient initialThreads={threads} staffName={ctx.fullName} />
    </div>
  );
}
