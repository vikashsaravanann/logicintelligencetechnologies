import "server-only";
import fs from "fs";
import path from "path";

export function resolveResourcePdfPath(filename: string): string | null {
  const safeFilename = path.basename(filename);
  const candidates = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), "private/resources", safeFilename),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public/resources", safeFilename),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", safeFilename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}
