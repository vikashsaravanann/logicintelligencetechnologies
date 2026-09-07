import { Metadata } from "next";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: `Sign in | ${COMPANY.displayName}`,
  description: `Sign in to the ${COMPANY.displayName} client portal to track projects, files, and support.`,
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
