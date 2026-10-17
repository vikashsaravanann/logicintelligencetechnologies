"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Camera,
  ShieldCheck,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building,
  Mail,
  BadgeAlert,
  Phone,
  Clock,
  MapPin,
  Bell,
  Sparkles,
} from "lucide-react";
import { SafeEmployeeWorkspaceDTO } from "@/lib/workspaces/types";

interface Props {
  workspace: SafeEmployeeWorkspaceDTO;
}

interface StaffProfile {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  employeeCode: string | null;
  department: string | null;
  jobTitle: string | null;
  employmentType: string | null;
  avatarUrl: string | null;
  portraitUrl: string | null;
  bio: string | null;
  skills: string[];
  workLocation: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  timezone: string;
  notificationPreferences: {
    email: boolean;
    in_app: boolean;
    digest: "realtime" | "daily" | "weekly";
  };
}

export default function ProfileManagerClient({ workspace }: Props) {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable Form fields
  const [bio, setBio] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [notifDigest, setNotifDigest] = useState<"realtime" | "daily" | "weekly">("realtime");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/workspaces/${workspace.workspaceId}/profile`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load profile");
      }
      const data = await res.json();
      const p: StaffProfile = data.profile;
      setProfile(p);
      setBio(p.bio || "");
      setSkillsStr((p.skills || []).join(", "));
      setWorkLocation(p.workLocation || "Chennai HQ");
      setEmergencyName(p.emergencyContactName || "");
      setEmergencyPhone(p.emergencyContactPhone || "");
      setTimezone(p.timezone || "Asia/Kolkata");
      setNotifEmail(p.notificationPreferences?.email ?? true);
      setNotifInApp(p.notificationPreferences?.in_app ?? true);
      setNotifDigest(p.notificationPreferences?.digest || "realtime");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [workspace.workspaceId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Portrait photo must be under 10 MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/workspaces/${workspace.workspaceId}/profile`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload photo");
      }

      const data = await res.json();
      if (profile) {
        setProfile({ ...profile, portraitUrl: data.portraitUrl });
      }
      setSuccess("Portrait photo updated successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const parsedSkills = skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        bio: bio.trim(),
        skills: parsedSkills,
        workLocation: workLocation.trim() || undefined,
        emergencyContactName: emergencyName.trim() || undefined,
        emergencyContactPhone: emergencyPhone.trim() || undefined,
        timezone,
        notificationPreferences: {
          email: notifEmail,
          in_app: notifInApp,
          digest: notifDigest,
        },
      };

      const res = await fetch(`/api/admin/workspaces/${workspace.workspaceId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully.");
      await loadProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-12 text-center text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
        <span className="text-xs">Loading staff profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Staff Member Profile
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Official staff identity, 4:5 portrait photo, delivery specializations, and contact details.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Super Admin Audited Profile</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Portrait and Official Identity Card */}
          <div className="space-y-6">
            {/* 4:5 Portrait Card */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-lg text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Official Portrait (4:5)
              </h3>

              <div className="relative mx-auto w-48 h-60 rounded-2xl overflow-hidden border-2 border-white/10 bg-neutral-950 flex items-center justify-center shadow-inner group">
                {profile?.portraitUrl ? (
                  <img
                    src={profile.portraitUrl}
                    alt={workspace.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <User className="w-16 h-16 text-neutral-600 mx-auto mb-2" />
                    <p className="text-[11px] text-neutral-500">
                      Upload standard 4:5 executive portrait
                    </p>
                  </div>
                )}

                <label
                  htmlFor="portrait-upload"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 cursor-pointer text-white text-xs font-bold"
                >
                  <Camera className="w-6 h-6 text-blue-400" />
                  <span>{uploadingPhoto ? "Uploading..." : "Change Portrait"}</span>
                </label>
                <input
                  id="portrait-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </div>

              <p className="text-[11px] text-neutral-500">
                Aspect ratio: 4:5 portrait crop. Used for client delivery introductions and executive credentials.
              </p>
            </div>

            {/* Read-Only Official Details */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-3.5 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-blue-400" /> Official Corporate Record
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                    Full Legal Name
                  </span>
                  <p className="font-semibold text-white">{profile?.fullName}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                    Corporate Email
                  </span>
                  <p className="font-semibold text-white">{profile?.email}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                    Employee Code
                  </span>
                  <p className="font-semibold text-blue-400 font-mono">
                    {profile?.employeeCode || "LIT-STAFF-PROV"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                    Department
                  </span>
                  <p className="font-semibold text-neutral-200">{profile?.department || "Engineering"}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                    Official Working Role
                  </span>
                  <p className="font-semibold text-neutral-200">{profile?.jobTitle || "Engineer"}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                    System Role
                  </span>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {profile?.role.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Two Columns: Editable Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio & Skills */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> Professional Bio & Specializations
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Professional Bio
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize your engineering background, domain expertise, and core competencies..."
                  className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-3 text-neutral-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Core Skills & Capabilities (Comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="Next.js, TypeScript, PostgreSQL, Machine Learning, Cloud Architecture, Supabase"
                  className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skillsStr
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0)
                    .map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Location & Emergency Contact */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> Location & Emergency Contact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Primary Work Location
                  </label>
                  <input
                    type="text"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    placeholder="e.g., Chennai HQ / Remote / Bangalore Tech Hub"
                    className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Operational Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+05:30)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST, UTC+04:00)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+08:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Next of kin or emergency contact"
                    className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" /> Operational Notification Preferences
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifEmail}
                    onChange={(e) => setNotifEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-white/20 bg-neutral-950"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-white">Email Notifications</span>
                    <p className="text-neutral-400">Receive transactional alerts for project invitations and client requests.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifInApp}
                    onChange={(e) => setNotifInApp(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-white/20 bg-neutral-950"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-white">In-App Alerts</span>
                    <p className="text-neutral-400">Show notification badges in command center and workspace navigation.</p>
                  </div>
                </label>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Activity Digest Frequency
                  </label>
                  <select
                    value={notifDigest}
                    onChange={(e) => setNotifDigest(e.target.value as any)}
                    className="w-full sm:w-60 text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="realtime">Realtime (Instant notifications)</option>
                    <option value="daily">Daily Summary Digest</option>
                    <option value="weekly">Weekly Rollup</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Profile Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
