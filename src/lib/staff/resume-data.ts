import "server-only";
import { getStaffProfileBundle } from "@/lib/staff/profile";

export type ResumeSkillGroup = { category: string; skills: string[] };

export type ResumeExperience = {
  title: string;
  organization: string;
  location?: string | null;
  startLabel: string;
  endLabel: string;
  bullets: string[];
  verifiedCompany?: boolean;
};

export type ResumeProject = {
  title: string;
  techLine?: string | null;
  bullets: string[];
};

export type ResumeEducation = {
  degree: string;
  years: string;
  detail: string;
};

export type ResumeDto = {
  fullName: string;
  headline: string;
  contactLine: string;
  linksLine: string;
  links: { label: string; url: string }[];
  summary: string | null;
  skillGroups: ResumeSkillGroup[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications: string[];
  achievements: string[];
};

function clean(s: unknown): string {
  return String(s || "").trim();
}

function joinPipes(parts: (string | null | undefined)[]): string {
  return parts.map((p) => clean(p)).filter(Boolean).join(" | ");
}

/** Map authenticated staff profile → resume DTO (no employee code / private fields). */
export async function buildResumeDto(userId: string): Promise<ResumeDto> {
  const { employee, details, entries } = await getStaffProfileBundle(userId);
  const d = (details || {}) as Record<string, unknown>;
  const list = (entries || []) as Array<Record<string, unknown>>;

  const fullName =
    clean(d.display_name) ||
    clean(employee?.full_name) ||
    "Staff Member";

  const headline =
    clean(d.professional_headline) ||
    clean(employee?.job_title) ||
    "Professional";

  const email =
    clean(d.personal_email) ||
    clean(employee?.email_normalized) ||
    "";
  const phone = clean(d.mobile_e164) || clean(employee?.phone_e164) || "";
  const location = clean(d.work_location) || "";

  const contactLine = joinPipes([email, phone, location]);

  const links = list
    .filter((e) => e.entry_type === "link")
    .map((e) => {
      const title = clean(e.title);
      const url = clean((e.metadata as { url?: string })?.url || e.description || e.organization);
      return { label: title || url, url };
    })
    .filter((l) => l.url.startsWith("http"));

  const linksLine = joinPipes(
    links.map((l) => {
      try {
        const u = new URL(l.url);
        return u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "");
      } catch {
        return l.label;
      }
    })
  );

  const summary =
    clean(d.professional_summary) ||
    clean(d.bio) ||
    null;

  // Skills: group by category from entries; fall back to details.skills array
  const skillEntries = list.filter((e) => e.entry_type === "skill");
  const groupMap = new Map<string, string[]>();
  for (const s of skillEntries) {
    const cat = clean(s.category) || "Technical Skills";
    const name = clean(s.title);
    if (!name) continue;
    if (!groupMap.has(cat)) groupMap.set(cat, []);
    groupMap.get(cat)!.push(name);
  }
  if (groupMap.size === 0 && Array.isArray(d.skills)) {
    groupMap.set(
      "Technical Skills",
      (d.skills as unknown[]).map((x) => clean(x)).filter(Boolean)
    );
  }
  const skillGroups: ResumeSkillGroup[] = [...groupMap.entries()].map(([category, skills]) => ({
    category,
    skills,
  }));

  const experience: ResumeExperience[] = [];
  // Verified current LIT role first when present
  if (employee?.job_title) {
    experience.push({
      title: employee.job_title,
      organization: "Logic Intelligence Technologies",
      location: location || "Coimbatore, India",
      startLabel: "",
      endLabel: "Present",
      bullets: [],
      verifiedCompany: true,
    });
  }
  for (const e of list.filter((x) => x.entry_type === "experience")) {
    const meta = (e.metadata || {}) as Record<string, unknown>;
    const bullets = Array.isArray(meta.bullets)
      ? (meta.bullets as unknown[]).map((b) => clean(b)).filter(Boolean)
      : clean(e.description)
        ? [clean(e.description)]
        : [];
    experience.push({
      title: clean(e.title) || "Role",
      organization: clean(e.organization) || "",
      location: clean(meta.location as string) || null,
      startLabel: e.start_date ? String(e.start_date).slice(0, 7) : "",
      endLabel: e.is_current ? "Present" : e.end_date ? String(e.end_date).slice(0, 7) : "",
      bullets,
    });
  }

  const projects: ResumeProject[] = list
    .filter((e) => e.entry_type === "project" && e.include_in_resume !== false)
    .map((e) => {
      const meta = (e.metadata || {}) as Record<string, unknown>;
      const tech = clean(meta.technologies as string) || clean(e.category);
      const bullets = Array.isArray(meta.bullets)
        ? (meta.bullets as unknown[]).map((b) => clean(b)).filter(Boolean)
        : clean(e.description)
          ? [clean(e.description)]
          : [];
      return {
        title: clean(e.title) || "Project",
        techLine: tech || null,
        bullets,
      };
    });

  const education: ResumeEducation[] = list
    .filter((e) => e.entry_type === "education")
    .map((e) => {
      const years = [
        e.start_date ? String(e.start_date).slice(0, 4) : "",
        e.is_current ? "Present" : e.end_date ? String(e.end_date).slice(0, 4) : "",
      ]
        .filter(Boolean)
        .join(" – ");
      const parts = [clean(e.organization), clean(e.description)].filter(Boolean);
      return {
        degree: clean(e.title) || "Education",
        years,
        detail: parts.join(" — "),
      };
    });

  const certifications = list
    .filter((e) => e.entry_type === "certification")
    .map((e) => {
      const org = clean(e.organization);
      const title = clean(e.title);
      return org ? `${title} — ${org}` : title;
    })
    .filter(Boolean);

  const achievements = list
    .filter((e) => e.entry_type === "achievement")
    .map((e) => clean(e.description) || clean(e.title))
    .filter(Boolean);

  return {
    fullName,
    headline,
    contactLine,
    linksLine,
    links,
    summary,
    skillGroups,
    experience,
    projects,
    education,
    certifications,
    achievements,
  };
}
