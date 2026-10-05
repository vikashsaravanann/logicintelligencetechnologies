import { COMPANY } from "./company";

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
  handle?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "LinkedIn",
    url: COMPANY.linkedinUrl,
    label: "Company LinkedIn",
    handle: "logic-intelligence-technologies",
  },
  {
    platform: "Instagram",
    url: COMPANY.instagramUrl,
    label: "Company Instagram",
    handle: "logicintelligencetechnologies",
  },
  {
    platform: "X",
    url: COMPANY.xUrl,
    label: "Company X / Twitter",
    handle: "logicintelltech",
  },
  {
    platform: "Facebook",
    url: COMPANY.facebookUrl,
    label: "Official Facebook Page",
    handle: "logicintelligencetechnologies",
  },
  {
    platform: "YouTube",
    url: COMPANY.youtubeUrl,
    label: "Official YouTube Channel",
    handle: "@logicintelligencetechnologies",
  },
  {
    platform: "Telegram",
    url: COMPANY.telegramBotUrl,
    label: "Official Telegram Bot",
    handle: "LogicIntelligenceTechnologiesbot",
  },
  {
    platform: "Threads",
    url: COMPANY.threadsUrl,
    label: "Official Threads Profile",
    handle: "logicintelligencetechnologies",
  },
  {
    platform: "WhatsApp",
    url: COMPANY.whatsappGroupUrl,
    label: "Official WhatsApp Community",
  },
  {
    platform: "GitHub",
    url: COMPANY.githubUrl,
    label: "Company GitHub",
    handle: "Logic-Intelligence",
  },
];
