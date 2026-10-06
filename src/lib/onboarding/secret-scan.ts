/**
 * Pure secret scanner for onboarding intake. Clients are told never to send
 * passwords or API keys; this catches obvious ones so we refuse the submission
 * before it is stored. It returns only WHERE a secret-like value was found and
 * WHAT KIND — never the value itself.
 */

export interface SecretFinding {
  path: string;
  kind: string;
}

const PATTERNS: Array<{ kind: string; re: RegExp }> = [
  { kind: "private_key", re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { kind: "stripe_key", re: /\bsk_(?:live|test)_[0-9A-Za-z]{10,}\b/ },
  { kind: "openai_key", re: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { kind: "github_token", re: /\bgh[pousr]_[0-9A-Za-z]{20,}\b/ },
  { kind: "aws_access_key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { kind: "google_api_key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { kind: "slack_token", re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { kind: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  // A credential assignment: password/secret/apikey = <value>. Requires a
  // delimiter and a value, so prose like "password reset flow" does not match.
  { kind: "credential_assignment", re: /\b(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?token)\b\s*[:=]\s*\S{6,}/i },
];

function scanString(value: string): string | null {
  for (const { kind, re } of PATTERNS) {
    if (re.test(value)) return kind;
  }
  return null;
}

/**
 * Walk a JSON-like value and report secret-like strings. Depth- and
 * breadth-bounded to stay cheap on hostile input. Never includes the value.
 */
export function findSecretLikeValues(input: unknown, basePath = ""): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const seen = new WeakSet<object>();

  function walk(value: unknown, path: string, depth: number): void {
    if (findings.length >= 50 || depth > 8) return;
    if (typeof value === "string") {
      const kind = scanString(value);
      if (kind) findings.push({ path: path || "(root)", kind });
      return;
    }
    if (value && typeof value === "object") {
      if (seen.has(value as object)) return;
      seen.add(value as object);
      const entries = Array.isArray(value)
        ? value.slice(0, 100).map((v, i) => [String(i), v] as const)
        : Object.entries(value as Record<string, unknown>).slice(0, 200);
      for (const [k, v] of entries) walk(v, path ? `${path}.${k}` : k, depth + 1);
    }
  }

  walk(input, basePath, 0);
  return findings;
}

/** Convenience: does this payload contain any secret-like value? */
export function containsSecretLikeValue(input: unknown): boolean {
  return findSecretLikeValues(input).length > 0;
}
