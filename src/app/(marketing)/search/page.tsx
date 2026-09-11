import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/data/blogData";
import { packagesData } from "@/data/packagesData";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Search",
  description: "Search packages and guides from Logic Intelligence Technologies.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const packs = query
    ? packagesData.filter((p) =>
        `${p.title} ${p.subtitle} ${p.price}`.toLowerCase().includes(query)
      )
    : packagesData;
  const posts = query
    ? blogPosts.filter((p) =>
        `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(query)
      )
    : blogPosts.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-32 pb-24 px-6">
      <JsonLd data={breadcrumb([{ name: "Home", path: "/" }, { name: "Search", path: "/search" }])} />
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3">Search</p>
        <h1 className="text-3xl font-black mb-6">
          {query ? `Results for “${q.trim()}”` : "Search the studio"}
        </h1>
        <form action="/search" method="get" className="mb-10">
          <input
            name="q"
            defaultValue={q}
            placeholder="Packages, prices, guides"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
          />
        </form>
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Packages</h2>
          <ul className="space-y-3">
            {packs.map((p) => (
              <li key={p.slug}>
                <Link href={`/packages/${p.slug}`} className="block rounded-2xl border border-white/10 p-4 hover:border-cyan-400/40">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-zinc-400">{p.price}</p>
                </Link>
              </li>
            ))}
            {packs.length === 0 && <li className="text-zinc-500 text-sm">No packages matched.</li>}
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Guides</h2>
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="block rounded-2xl border border-white/10 p-4 hover:border-cyan-400/40">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-zinc-400">{p.excerpt}</p>
                </Link>
              </li>
            ))}
            {posts.length === 0 && <li className="text-zinc-500 text-sm">No guides matched.</li>}
          </ul>
        </section>
      </div>
    </main>
  );
}
