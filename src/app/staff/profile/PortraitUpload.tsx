"use client";

import { useState } from "react";

export function PortraitUpload({ currentUrl }: { currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    // Client-side 4:5 crop via canvas center-crop
    try {
      setBusy(true);
      const blob = await centerCropTo45(file);
      const fd = new FormData();
      fd.append("file", blob, "portrait.jpg");
      const res = await fetch("/api/staff/profile/portrait", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.error || "Upload failed");
        return;
      }
      setUrl(data.portraitUrl);
      setPreview(data.portraitUrl);
    } catch (err: any) {
      setError(err?.message || "Crop/upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <div className="h-24 w-[76.8px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {url || preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview || url || ""} alt="Portrait" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-400">4:5</div>
        )}
      </div>
      <div>
        <label className="inline-flex cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} disabled={busy} />
          {busy ? "Uploading…" : "Upload 4:5 portrait"}
        </label>
        <p className="mt-1 text-[11px] text-slate-500">JPEG/PNG/WebP · auto center-crop to 4:5 · max 10 MB</p>
        {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}

async function centerCropTo45(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const targetRatio = 4 / 5;
  let cropW = srcW;
  let cropH = srcH;
  let sx = 0;
  let sy = 0;
  if (srcW / srcH > targetRatio) {
    cropW = Math.round(srcH * targetRatio);
    sx = Math.round((srcW - cropW) / 2);
  } else {
    cropH = Math.round(srcW / targetRatio);
    sy = Math.round((srcH - cropH) / 2);
  }
  const outW = Math.min(800, cropW);
  const outH = Math.round(outW / targetRatio);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, sx, sy, cropW, cropH, 0, 0, outW, outH);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), "image/jpeg", 0.9);
  });
}
