"use client";

import { useState } from "react";

type Doc = {
  id: string;
  fileName: string;
  sizeBytes: number | null;
  mimeType: string | null;
  category: string | null;
  description: string | null;
  createdAt: string | null;
};

export function DocumentWalletClient({ initialDocs }: { initialDocs: Doc[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/staff/documents", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setDocs((prev) => [data.document, ...prev]);
      setOk("Document saved to your wallet.");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
        <input type="file" className="hidden" onChange={onUpload} disabled={busy} />
        {busy ? "Uploading…" : "Upload document"}
      </label>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}
      {ok ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{ok}</p>
      ) : null}
      {docs.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{d.fileName}</p>
                <p className="text-xs text-slate-500">
                  {d.mimeType || "file"}
                  {d.sizeBytes != null ? ` · ${(d.sizeBytes / 1024).toFixed(1)} KB` : ""}
                  {d.createdAt ? ` · ${new Date(d.createdAt).toLocaleString()}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No documents in your wallet yet.</p>
      )}
    </div>
  );
}
