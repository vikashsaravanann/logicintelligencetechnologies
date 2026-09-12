import "server-only";

export function maskEmail(email: string): string {
  const value = String(email || "").trim().toLowerCase();
  const at = value.indexOf("@");
  if (at <= 0) return "***";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const shown = local.slice(0, 1);
  return `${shown}***@${domain}`;
}

export function emailLog(
  level: "info" | "warn" | "error",
  event: string,
  fields: Record<string, unknown>
) {
  const payload = { event, ...fields };
  if (level === "error") console.error("[email]", payload);
  else if (level === "warn") console.warn("[email]", payload);
  else console.info("[email]", payload);
}
