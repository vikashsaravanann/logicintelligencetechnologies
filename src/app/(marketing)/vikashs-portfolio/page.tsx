import { redirect } from "next/navigation";

/** Permanent entry: serve static portfolio (no iframe cache isolation). */
export default function VikashPortfolioPage() {
  redirect("/vikash-portfolio/index.html?v=20260907e");
}
