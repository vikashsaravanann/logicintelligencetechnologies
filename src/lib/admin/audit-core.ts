/**
 * Pure helpers for the admin audit log (no server-only imports, unit-testable).
 */

const SENSITIVE_KEY = /pass|secret|token|key|authorization|cookie|credential/i;
const MAX_STRING = 500;
const MAX_BYTES = 8192;

/** A valid audit action name: dotted lower_snake, e.g. "support.ticket.resolve". */
export function isValidActionName(action: string): boolean {
  return /^[a-z_]+\.[a-z_.]+$/.test(action);
}

/**
 * Redact metadata before it is written to the audit log: drop keys that look
 * like secrets, truncate long strings, and cap the overall JSON size. Returns a
 * plain object safe to persist.
 */
export function redactMetadata(input: unknown): Record<string, unknown> {
  const seen = new WeakSet<object>();

  function walk(value: unknown, depth: number): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") {
      return value.length > MAX_STRING ? value.slice(0, MAX_STRING) + "…" : value;
    }
    if (typeof value === "number" || typeof value === "boolean") return value;
    if (depth >= 6) return "[depth]";
    if (Array.isArray(value)) {
      if (seen.has(value)) return "[circular]";
      seen.add(value);
      return value.slice(0, 50).map((v) => walk(v, depth + 1));
    }
    if (typeof value === "object") {
      if (seen.has(value as object)) return "[circular]";
      seen.add(value as object);
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        out[k] = SENSITIVE_KEY.test(k) ? "[redacted]" : walk(v, depth + 1);
      }
      return out;
    }
    return undefined;
  }

  const result = walk(input, 0);
  const obj: Record<string, unknown> =
    result && typeof result === "object" && !Array.isArray(result)
      ? (result as Record<string, unknown>)
      : { value: result };

  // Enforce the byte cap; drop keys until it fits rather than risk a DB reject.
  let json = JSON.stringify(obj);
  if (json.length > MAX_BYTES) {
    const keys = Object.keys(obj);
    while (keys.length && json.length > MAX_BYTES) {
      delete obj[keys.pop() as string];
      json = JSON.stringify(obj);
    }
    obj._truncated = true;
  }
  return obj;
}
