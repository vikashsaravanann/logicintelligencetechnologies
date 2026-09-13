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
    platform: "GitHub",
    url: "https://github.com/vikashsaravanann",
    label: "Engineering GitHub",
    handle: "vikashsaravanann",
  },
  {
    platform: "WhatsApp",
    url: COMPANY.whatsappGroupUrl,
    label: "Official WhatsApp Group",
  },
  {
    platform: "Telegram",
    url: COMPANY.telegramBotUrl,
    label: "Official Telegram Channel",
  },
  {
    platform: "Facebook",
    url: COMPANY.facebookUrl,
    label: "Official Facebook Page",
  },
];
