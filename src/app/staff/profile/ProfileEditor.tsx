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

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <span aria-hidden>🔒</span> {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-900 break-words">{value}</p>
    </div>
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
  const [section, setSection] = useState("overview");

  const completion = useMemo(() => {
    const checks = [name, headline, bio || summary, location, timezone, entries.length > 0];
    const hit = checks.filter(Boolean).length;
    return Math.round((hit / checks.length) * 100);
  }, [name, headline, bio, summary, location, timezone, entries.length]);

  async function saveCore(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/staff/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          display_name: displayName || null,
          professional_headline: headline || null,
          bio: bio || null,
          professional_summary: summary || null,
          career_objective: objective || null,
          professional_interests: interests || null,
          work_location: location || null,
          timezone: timezone || null,
          mobile_e164: mobile || null,
          personal_email: personalEmail || null,
          work_arrangement: arrangement || null,
          emergency_contact_name: emName || null,
          emergency_contact_phone: emPhone || null,
          emergency_contact_relationship: emRel || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setMessage(data.message || "Saved successfully.");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function addSkill() {
    const title = newSkill.trim();
    if (!title) return;
    setBusy(true);
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

  const nav = [
    ["overview", "Overview"],
    ["personal", "Personal"],
    ["about", "About Me"],
    ["skills", "Skills"],
    ["entries", "Career records"],
    ["private", "Private"],
    ["resume", "Resume"],
  ] as const;

  const byType = (t: string) => entries.filter((e) => e.entry_type === t);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Welcome to Your LIT Professional Profile
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Maintain personal information, technical expertise and career achievements. Official
          employee code, company email, department, job title and system role are managed by LIT
          administration.
        </p>
        <p className="mt-3 text-xs font-medium text-slate-500">Profile completion · {completion}%</p>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-[var(--lit-teal,#1FA9A2)]" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {nav.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              section === id
                ? "bg-[var(--lit-teal,#1FA9A2)] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(section === "overview" || section === "personal") && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Company-controlled employment</h2>
          <p className="text-xs text-slate-500">
            These details are maintained by Logic Intelligence Technologies. Contact an authorized
            administrator if a correction is required.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <LockedField
              label="Employee code"
              value={employeeCode || "Not Assigned"}
            />
            <LockedField label="Official company email" value={email || "—"} />
            <LockedField label="Department" value={department || "—"} />
            <LockedField label="Job title" value={jobTitle || "—"} />
            <LockedField label="System role" value={role || "—"} />
          </div>
          {!employeeCode ? (
            <p className="text-xs text-amber-800">
              Your employee code is managed by the LIT administration team.
            </p>
          ) : null}
        </section>
      )}

      <form onSubmit={saveCore} className="space-y-4">
        {(section === "overview" || section === "personal") && (
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Personal details</h2>
            <label className="block text-xs font-medium text-slate-700">
              Full legal name
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How colleagues may address you"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-700">
                Mobile number
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Personal email
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  placeholder="yourname@example.com"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-700">
                City / location
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Chennai, Tamil Nadu, India"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Time zone
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Asia/Kolkata"
                />
              </label>
            </div>
            <label className="block text-xs font-medium text-slate-700">
              Work arrangement
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
          </section>
        )}

        {(section === "overview" || section === "about") && (
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">About Me</h2>
            <label className="block text-xs font-medium text-slate-700">
              Professional headline
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={160}
                placeholder="Full-Stack Engineer | AI Applications | Cloud Architecture"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Short biography
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={600}
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Detailed professional summary
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={5}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={2500}
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Career objective
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Professional interests
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="AI, Healthcare Technology, Automation"
              />
            </label>
          </section>
        )}

        {section === "private" && (
          <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-5">
            <h2 className="text-sm font-semibold text-slate-900">Private information</h2>
            <p className="text-xs text-slate-600">
              Stored for legitimate employee support and emergencies. Never included in resume
              export.
            </p>
            <label className="block text-xs font-medium text-slate-700">
              Emergency contact name
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={emName}
                onChange={(e) => setEmName(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Relationship
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={emRel}
                onChange={(e) => setEmRel(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Emergency phone
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={emPhone}
                onChange={(e) => setEmPhone(e.target.value)}
              />
            </label>
          </section>
        )}

        {(section === "personal" ||
          section === "about" ||
          section === "private" ||
          section === "overview") && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
            {message ? <p className="text-xs font-medium text-teal-800">{message}</p> : null}
            {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
          </div>
        )}
      </form>

      {section === "skills" && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Skills & expertise</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. TypeScript, PostgreSQL, Next.js"
            />
            <button
              type="button"
              onClick={addSkill}
              disabled={busy}
              className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-3 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {byType("skill").map((s) => (
              <li
                key={s.id}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs"
              >
                {s.title}
                <button type="button" className="text-slate-400 hover:text-red-600" onClick={() => removeEntry(s.id)}>
                  ×
                </button>
              </li>
            ))}
            {byType("skill").length === 0 ? (
              <li className="text-sm text-slate-500">No skills added yet.</li>
            ) : null}
          </ul>
        </section>
      )}

      {section === "entries" && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Career records</h2>
          <p className="text-xs text-slate-500">
            Education, experience, certifications, projects and links can be added as structured
            entries. Use skills tab for quick technical tags.
          </p>
          {(["education", "experience", "certification", "project", "achievement", "link", "language"] as const).map(
            (type) => (
              <div key={type}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{type}</h3>
                <ul className="mt-1 space-y-1">
                  {byType(type).map((e) => (
                    <li key={e.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{e.title || "Untitled"}</p>
                        <p className="text-xs text-slate-500">
                          {[e.organization, e.category].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button type="button" className="text-xs text-red-600" onClick={() => removeEntry(e.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                  {byType(type).length === 0 ? (
                    <li className="text-xs text-slate-400">No {type} records yet.</li>
                  ) : null}
                </ul>
                <AddEntryForm type={type} onAdded={(entry) => setEntries((p) => [...p, entry])} />
              </div>
            )
          )}
        </section>
      )}

      {section === "resume" && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Resume profile preview</h2>
          <p className="text-xs text-slate-500">
            Employee-controlled summary. Official role is verified; other claims are self-reported.
            Employee code, emergency contacts and internal systems are excluded.
          </p>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm whitespace-pre-wrap">
            <p className="text-lg font-bold text-slate-900">{name}</p>
            {headline ? <p className="text-slate-700">{headline}</p> : null}
            <p className="mt-1 text-xs text-slate-500">
              {[jobTitle, department].filter(Boolean).join(" · ")} (company-verified title)
            </p>
            {location ? <p className="text-xs text-slate-500">{location}</p> : null}
            {(summary || bio) && (
              <p className="mt-3 text-slate-700">{summary || bio}</p>
            )}
            {byType("skill").length > 0 && (
              <p className="mt-3">
                <span className="font-semibold">Skills: </span>
                {byType("skill")
                  .map((s) => s.title)
                  .join(", ")}
              </p>
            )}
          </div>
        </section>
      )}
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
    <form onSubmit={submit} className="mt-2 flex flex-wrap gap-2">
      <input
        className="min-w-[140px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="min-w-[140px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
        placeholder="Organization / issuer"
        value={org}
        onChange={(e) => setOrg(e.target.value)}
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700"
      >
        Add {type}
      </button>
    </form>
  );
}
