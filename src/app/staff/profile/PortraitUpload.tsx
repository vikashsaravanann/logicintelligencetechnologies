"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function PortraitUpload({ currentUrl }: { currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Max 10 MB.");
      return;
    }
    setError(null);
    if (src) URL.revokeObjectURL(src);
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setOpen(true);
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      dragRef.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
    },
    [offsetX, offsetY]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setOffsetX(dragRef.current.ox + (e.clientX - dragRef.current.x));
    setOffsetY(dragRef.current.oy + (e.clientY - dragRef.current.y));
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  async function confirmUpload() {
    if (!src || !imgRef.current) return;
    setBusy(true);
    setError(null);
    try {
      // Crop frame size for mapping; output remains 800×1000 (4:5)
      const blob = await renderCrop(imgRef.current, zoom, offsetX, offsetY, 280, 350);
      const fd = new FormData();
      fd.append("file", blob, "portrait.jpg");
      const res = await fetch("/api/staff/profile/portrait", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.error || "Upload failed");
        return;
      }
      setUrl(data.portraitUrl);
      setOpen(false);
      if (src) URL.revokeObjectURL(src);
      setSrc(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Crop failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-full text-center">
      <div
        className="
          relative mx-auto
          w-[180px]
          max-w-full
          aspect-[4/5]
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-slate-100
          shadow-sm
          sm:w-[200px]
          md:w-[240px]
          lg:w-[280px]
        "
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Employee portrait"
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <svg
              className="h-16 w-16 sm:h-20 sm:w-20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              aria-hidden
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
            </svg>
            <span className="text-xs font-medium">No photo</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onPick}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          {url ? "Change Profile Photo" : "Upload Photo"}
        </button>
        <p className="mx-auto max-w-sm text-[11px] leading-relaxed text-slate-500">
          Upload a JPEG, PNG or WebP image. Adjust your portrait using the interactive 4:5 crop.
        </p>
        {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
      </div>

      {open && src ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Crop portrait"
        >
          <div className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Adjust 4:5 crop</h3>
            <p className="mt-1 text-xs text-slate-500">Drag to reposition. Use zoom for framing.</p>
            <div
              className="relative mx-auto mt-3 aspect-[4/5] w-full max-w-[280px] touch-none overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                  minWidth: "100%",
                  minHeight: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <label className="mt-3 block text-xs font-medium text-slate-700">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={confirmUpload}
                className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Uploading…" : "Confirm & Upload"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setOpen(false);
                  if (src) URL.revokeObjectURL(src);
                  setSrc(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function renderCrop(
  img: HTMLImageElement,
  zoom: number,
  offsetX: number,
  offsetY: number,
  frameW: number,
  frameH: number
): Promise<Blob> {
  await img.decode().catch(() => undefined);
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const baseScale = Math.max(frameW / nw, frameH / nh);
  const scale = baseScale * zoom;
  const dispW = nw * scale;
  const dispH = nh * scale;
  const left = frameW / 2 - dispW / 2 + offsetX;
  const top = frameH / 2 - dispH / 2 + offsetY;
  const sx = (0 - left) / scale;
  const sy = (0 - top) / scale;
  const sw = frameW / scale;
  const sh = frameH / scale;
  const outW = 800;
  const outH = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), "image/jpeg", 0.92);
  });
}
