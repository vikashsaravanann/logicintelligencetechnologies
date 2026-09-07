import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logic AI",
  description:
    "LOGIC INTELLIGENCE TECHNOLOGIES — Logic AI. Private answers from your documents, plus company knowledge. Streaming assistant. Demo first.",
};

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
