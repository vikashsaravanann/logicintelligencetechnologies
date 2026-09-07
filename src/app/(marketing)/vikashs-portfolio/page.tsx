import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vikash's Portfolio | Logic Intelligence Technologies",
  description:
    "Personal portfolio of Vikash Saravanan — AI & Data Science, full-stack engineering, certifications, and founder of Logic Intelligence Technologies.",
};

/** Full startupwithvikash experience via static assets; projects.html excluded. */
export default function VikashPortfolioPage() {
  return (
    <iframe
      src="/vikash-portfolio/index.html"
      title="Vikash's Portfolio"
      className="fixed inset-0 w-full h-full border-0 z-[100] bg-black"
      allow="clipboard-write"
    />
  );
}
