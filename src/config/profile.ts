/**
 * Configuration and validation schema definitions for unified user profile.
 */

export interface ProfileSection {
  id: string;
  title: string;
  description: string;
}

export const PROFILE_CONFIG = {
  canonicalPath: "/profile",
  legacyPaths: ["/client/profile"],
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Manage your name, contact phone, and organization details.",
    },
    {
      id: "security",
      title: "Security & Credentials",
      description: "Password updates, multi-factor authentication, and active sessions.",
    },
    {
      id: "notifications",
      title: "Notification Preferences",
      description: "Configure email alerts for project updates, invoices, and system advisories.",
    },
    {
      id: "danger",
      title: "Danger Zone",
      description: "Account deactivation and GDPR/data removal requests.",
    },
  ] as const,
  validUpdateColumns: ["full_name", "company_name", "phone_number"] as const,
} as const;
