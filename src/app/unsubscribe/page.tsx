import { COMPANY } from "@/config/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Email preferences | Logic Intelligence Technologies",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string; error?: string }>;
}) {
  const params = await searchParams;
  const done = params.done === "1";
  const error = params.error === "1";
  const token = params.token || "";

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{COMPANY.displayName}</p>
        <h1 className="mt-4 text-3xl font-semibold">Email preferences</h1>
        {done ? (
          <p className="mt-4 text-slate-300">
            You have been unsubscribed from marketing emails. Transactional messages
            about requests you submit may still be sent.
          </p>
        ) : error ? (
          <p className="mt-4 text-slate-300">
            This unsubscribe link is invalid or has expired. Email{" "}
            <a className="text-cyan-300 underline" href={`mailto:${COMPANY.emails.support}`}>
              {COMPANY.emails.support}
            </a>{" "}
            and we will remove you manually.
          </p>
        ) : (
          <>
            <p className="mt-4 text-slate-300">
              Confirm that you want to stop receiving marketing emails from Logic
              Intelligence Technologies.
            </p>
            <form method="post" action="/api/unsubscribe" className="mt-8">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950"
              >
                Unsubscribe
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
