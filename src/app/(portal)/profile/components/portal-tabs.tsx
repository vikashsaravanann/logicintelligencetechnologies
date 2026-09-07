"use client";

import { useState } from "react";
import { User, Briefcase, Receipt, Shield, MessageSquare, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileForm from "../profile-form";
import { ProjectsTab } from "./projects-tab";
import { BillingTab } from "./billing-tab";
import { VaultTab } from "./vault-tab";
import { SupportTab } from "./support-tab";
import { OnboardingTab } from "./onboarding-tab";

interface PortalTabsProps {
  portalData: {
    projects: unknown[];
    invoices: unknown[];
    supportTickets: unknown[];
    clientFiles: unknown[];
    onboarding: unknown[];
    user: unknown;
  } | null;
  profileDetails: {
    fullName: string;
    email: string;
    companyName: string;
    phoneNumber: string;
  };
}

export function PortalTabs({ portalData, profileDetails }: PortalTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const data = {
    projects: portalData?.projects ?? [],
    invoices: portalData?.invoices ?? [],
    supportTickets: portalData?.supportTickets ?? [],
    clientFiles: portalData?.clientFiles ?? [],
    onboarding: portalData?.onboarding ?? [],
    user: portalData?.user ?? null,
  };

  const tabs = [
    { id: "profile", label: "Details", icon: User },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "billing", label: "Billing", icon: Receipt },
    { id: "vault", label: "Vault", icon: Shield },
    { id: "support", label: "Support", icon: MessageSquare },
    { id: "onboarding", label: "Onboarding", icon: ClipboardList },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileForm
            initialFullName={profileDetails.fullName}
            email={profileDetails.email}
            initialCompanyName={profileDetails.companyName}
            initialPhoneNumber={profileDetails.phoneNumber}
          />
        );
      case "projects":
        return <ProjectsTab projects={data.projects} />;
      case "billing":
        return <BillingTab invoices={data.invoices} />;
      case "vault":
        return <VaultTab files={data.clientFiles} user={data.user} />;
      case "support":
        return <SupportTab tickets={data.supportTickets} />;
      case "onboarding":
        return <OnboardingTab onboarding={data.onboarding} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-2 rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 min-h-11 px-2 rounded-xl text-[12px] font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-300 to-sky-400 text-[#041018]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="w-full min-w-0 min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
