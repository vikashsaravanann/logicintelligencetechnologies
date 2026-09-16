/** Safe template variable substitution — never invent missing values */
export function personalize(
  template: string,
  vars: Record<string, string | null | undefined>
): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const v = vars[key];
      if (v && String(v).trim()) return String(v).trim();
      if (key === "firstName" || key === "fullName") return "";
      return "";
    })
    .replace(/Hi\s+,/g, "Hello,")
    .replace(/Hello\s+,/g, "Hello,")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function firstNameFrom(fullName?: string | null): string {
  if (!fullName) return "";
  return fullName.trim().split(/\s+/)[0] || "";
}
