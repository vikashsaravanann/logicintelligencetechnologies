"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Entry = {
  id: string;
  entry_type: string;
  title: string | null;
  organization: string | null;
  category: string | null;
  description: string | null;
  include_in_resume?: boolean;
};

type Props = {
  fullName: string;
  employeeCode: string | null;
  email: string | null;
  department: string;
  jobTitle: string;
  role: string;
  details: Record<string, unknown> | null;
  entries: Entry[];
};

function LockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function LockedField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-h-[4.75rem] min-w-0 flex-col justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-50/40 px-3.5 py-3 shadow-[0_1px_0_rgba(15,23,42,0.03)] sm:px-4">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm">
          <LockIcon className="h-3 w-3" />
        </span>
        <span>{label}</span>
        <span className="sr-only"> (company-managed, not editable)</span>
      </div>
      <p
        className={
          "mt-1.5 break-words text-sm font-semibold leading-snug text-slate-900 " +
          (mono ? "font-mono tracking-wide" : "")
        }
      >
        {value || "—"}
      </p>
    </div>
  );
}

function Card({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h2>
      {description ? <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function ProfileEditor({
  fullName,
  employeeCode,
  email,
  department,
  jobTitle,
  role,
  details,
  entries: initialEntries,
}: Props) {
  const router = useRouter();
  const d = details || {};
  const [name, setName] = useState(fullName);
  const [displayName, setDisplayName] = useState(String(d.display_name || ""));
  const [headline, setHeadline] = useState(String(d.professional_headline || ""));
  const [bio, setBio] = useState(String(d.bio || ""));
  const [summary, setSummary] = useState(String(d.professional_summary || ""));
  const [objective, setObjective] = useState(String(d.career_objective || ""));
  const [interests, setInterests] = useState(String(d.professional_interests || ""));
  const [location, setLocation] = useState(String(d.work_location || ""));
  const [timezone, setTimezone] = useState(String(d.timezone || "Asia/Kolkata"));
  const [mobile, setMobile] = useState(String(d.mobile_e164 || ""));
  const [personalEmail, setPersonalEmail] = useState(String(d.personal_email || ""));
  const [arrangement, setArrangement] = useState(String(d.work_arrangement || ""));
  const [emName, setEmName] = useState(String(d.emergency_contact_name || ""));
  const [emPhone, setEmPhone] = useState(String(d.emergency_contact_phone || ""));
  const [emRel, setEmRel] = useState(String(d.emergency_contact_relationship || ""));
  const [entries, setEntries] = useState(initialEntries);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");

  const completion = useMemo(() => {
    const checks = [
      Boolean(name?.trim()),
      Boolean(headline?.trim()),
      Boolean((summary || bio)?.trim()),
      Boolean(location?.trim()),
      entries.some((e) => e.entry_type === "skill"),
      entries.some((e) => e.entry_type === "experience" || e.entry_type === "education"),
    ];
    const hit = checks.filter(Boolean).length;
    return Math.round((hit / checks.length) * 100);
  }, [name, headline, bio, summary, location, entries]);

  async function saveProfile(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/staff/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setMessage(data.message || "Your profile information has been saved successfully.");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function savePersonal(e: React.FormEvent) {
    e.preventDefault();
    await saveProfile({
      full_name: name,
      display_name: displayName || null,
      mobile_e164: mobile || null,
      personal_email: personalEmail || null,
      work_location: location || null,
      timezone: timezone || null,
      work_arrangement: arrangement || null,
    });
  }

  async function saveAbout(e: React.FormEvent) {
    e.preventDefault();
    await saveProfile({
      professional_headline: headline || null,
      bio: bio || null,
      professional_summary: summary || null,
      career_objective: objective || null,
      professional_interests: interests || null,
    });
  }

  async function savePrivate(e: React.FormEvent) {
    e.preventDefault();
    await saveProfile({
      emergency_contact_name: emName || null,
      emergency_contact_phone: emPhone || null,
      emergency_contact_relationship: emRel || null,
    });
  }

  async function addSkill() {
    const title = newSkill.trim();
    if (!title) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/profile/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_type: "skill", title, category: "Technical" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not add skill");
        return;
      }
      setEntries((prev) => [...prev, data.entry]);
      setNewSkill("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/staff/profile/entries?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Delete failed");
        return;
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const byType = (t: string) => entries.filter((e) => e.entry_type === t);

  const feedback = (
    <div className="min-h-[1.25rem]" aria-live="polite">
      {message ? <p className="text-xs font-medium text-teal-800">{message}</p> : null}
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-5 sm:space-y-6">
      {/* Welcome + completion */}
      <Card title="Welcome to Your LIT Professional Profile">
        <p className="text-sm leading-relaxed text-slate-600">
          Your professional profile keeps your personal information, employment identity, technical
          expertise and career achievements organized in one secure location. You can maintain your
          personal information, skills, education, work experience, certifications and professional
          background, and use selected details to prepare your resume.
        </p>
        <p className="text-xs text-slate-500">
          Official employee code, company email, department, job title and system role are
          maintained by Logic Intelligence Technologies.
        </p>
        <div>
          <p className="text-xs font-medium text-slate-500">Profile completion · {completion}%</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[var(--lit-teal,#1FA9A2)] transition-[width]"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Company-controlled */}
      <Card
        id="company-controlled"
        title="Company-Controlled Employment"
        description="These details are maintained by Logic Intelligence Technologies and cannot be changed directly by employees."
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          <LockedField
            label="Employee code"
            value={employeeCode || "Not Assigned"}
            mono
          />
          <LockedField label="Official company email" value={email || "—"} mono />
          <LockedField label="Department" value={department || "—"} />
          <LockedField label="Job title" value={jobTitle || "—"} />
          <div className="sm:col-span-2">
            <LockedField label="System role" value={role || "—"} />
          </div>
        </div>
        {!employeeCode ? (
          <p className="text-xs text-amber-800">
            Your employee code is managed by the LIT administration team.
          </p>
        ) : null}
      </Card>

      {/* Personal details */}
      <form onSubmit={savePersonal}>
        <Card
          id="personal"
          title="Personal Details"
          description="Update contact and location information used across your Staff Workspace profile."
        >
          <label className="block text-xs font-medium text-slate-700">
            Full legal name
            <input
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={120}
            />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Preferred display name
            <input
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How colleagues may address you"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">
              Mobile number
              <input
                className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Personal email
              <input
                type="email"
                className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="yourname@example.com"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">
              City / professional location
              <input
                className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Chennai, Tamil Nadu, India"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Time zone
              <input
                className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
              />
            </label>
          </div>
          <label className="block text-xs font-medium text-slate-700">
            Work arrangement
            <select
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={arrangement}
              onChange={(e) => setArrangement(e.target.value)}
            >
              <option value="">Not specified</option>
              <option value="on_site">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="flexible">Flexible</option>
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save Personal Details"}
            </button>
            {feedback}
          </div>
        </Card>
      </form>

      {/* About Me */}
      <form onSubmit={saveAbout}>
        <Card
          id="about"
          title="About Me & Professional Summary"
          description="Introduce your background, strengths and the work you contribute to."
        >
          <label className="block text-xs font-medium text-slate-700">
            Professional headline
            <input
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={160}
              placeholder="Full-Stack Engineer | AI Applications | Cloud Architecture"
            />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Short biography
            <textarea
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={600}
            />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Detailed professional summary
            <textarea
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={5}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={2500}
            />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Career objective
            <textarea
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Professional interests
            <input
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="AI, Healthcare Technology, Automation"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save About Me"}
            </button>
            {feedback}
          </div>
        </Card>
      </form>

      {/* Skills */}
      <Card
        id="skills"
        title="Skills & Expertise"
        description="Add technical and professional skills as structured tags."
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="e.g. TypeScript, PostgreSQL, Next.js"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addSkill();
              }
            }}
          />
          <button
            type="button"
            onClick={addSkill}
            disabled={busy}
            className="shrink-0 rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add Skill
          </button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {byType("skill").map((s) => (
            <li
              key={s.id}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs"
            >
              <span className="min-w-0 truncate">{s.title}</span>
              <button
                type="button"
                className="shrink-0 text-slate-400 hover:text-red-600"
                onClick={() => removeEntry(s.id)}
                aria-label={`Remove ${s.title}`}
              >
                ×
              </button>
            </li>
          ))}
          {byType("skill").length === 0 ? (
            <li className="text-sm text-slate-500">No skills added yet.</li>
          ) : null}
        </ul>
      </Card>

      {/* Career records — sequential */}
      {(
        [
          ["education", "Education", "Academic qualifications and coursework."],
          ["experience", "Work Experience", "Previous and current professional roles."],
          ["certification", "Certifications", "Credentials and professional training."],
          ["project", "Projects & Contributions", "Selected technical and professional projects."],
          ["achievement", "Achievements", "Recognition and measurable outcomes."],
          ["link", "Professional Links", "LinkedIn, GitHub, portfolio and publications."],
          ["language", "Languages", "Spoken and written language proficiency."],
        ] as const
      ).map(([type, title, desc]) => (
        <Card key={type} id={type} title={title} description={desc}>
          <ul className="space-y-2">
            {byType(type).map((e) => (
              <li
                key={e.id}
                className="flex min-w-0 flex-col gap-2 rounded-lg border border-slate-100 px-3 py-2 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-slate-900">
                    {e.title || "Untitled"}
                  </p>
                  <p className="break-words text-xs text-slate-500">
                    {[e.organization, e.category].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 self-start text-xs font-semibold text-red-600"
                  onClick={() => removeEntry(e.id)}
                >
                  Remove
                </button>
              </li>
            ))}
            {byType(type).length === 0 ? (
              <li className="text-xs text-slate-400">No {title.toLowerCase()} records yet.</li>
            ) : null}
          </ul>
          <AddEntryForm type={type} onAdded={(entry) => setEntries((p) => [...p, entry])} />
        </Card>
      ))}

      {/* Private */}
      <form onSubmit={savePrivate}>
        <Card
          id="private"
          title="Private Information"
          description="Used only for authorized employee-support purposes and excluded from professional resume exports."
        >
          <label className="block text-xs font-medium text-slate-700">
            Emergency contact name
            <input
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={emName}
              onChange={(e) => setEmName(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Relationship
            <input
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={emRel}
              onChange={(e) => setEmRel(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Emergency phone
            <input
              className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={emPhone}
              onChange={(e) => setEmPhone(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save Private Information"}
            </button>
            {feedback}
          </div>
        </Card>
      </form>
    </div>
  );
}

function AddEntryForm({
  type,
  onAdded,
}: {
  type: string;
  onAdded: (entry: Entry) => void;
}) {
  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/staff/profile/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_type: type,
          title: title.trim(),
          organization: org.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.entry) {
        onAdded(data.entry);
        setTitle("");
        setOrg("");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <input
        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
        placeholder="Organization / issuer"
        value={org}
        onChange={(e) => setOrg(e.target.value)}
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
      >
        Add {type}
      </button>
    </form>
  );
}
