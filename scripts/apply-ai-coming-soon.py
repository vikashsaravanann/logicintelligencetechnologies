#!/usr/bin/env python3
from pathlib import Path

p = Path("src/app/ai/page.tsx")
t = p.read_text()
if "comingSoonNote" not in t:
    t = t.replace(
        "const [landed, setLanded] = useState(true);",
        "const [landed, setLanded] = useState(true);\n  const [comingSoonNote, setComingSoonNote] = useState(false);",
    )

old = """            <button
              type=\"button\"
              onClick={async () => {
                // Require auth before entering the chat workspace
                const { data } = await supabase.auth.getUser();
                if (!data.user) {
                  router.push(\"/login?next=/ai\");
                  return;
                }
                setLanded(false);
              }}
              className=\"inline-flex items-center justify-center gap-2 rounded-full bg-[#E8651C] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(232,101,28,0.35)] hover:brightness-110\"
            >
              Get Started <ArrowRight className=\"w-4 h-4\" />
            </button>"""

new = """            <button
              type=\"button\"
              onClick={() => setComingSoonNote(true)}
              aria-label=\"Coming Soon - AI Workspace not yet publicly available\"
              className=\"inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md hover:bg-white/15 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors\"
            >
              Coming Soon
            </button>"""

if old in t:
    t = t.replace(old, new)
elif "Get Started" in t:
    # Fallback: replace label only and neutralize onClick body markers
    t = t.replace("Get Started <ArrowRight className=\"w-4 h-4\" />", "Coming Soon")

needle = """            <Link href=\"/ai-assistant\" className=\"rounded-full border border-white/15 bg-black/25 px-5 py-3 text-sm text-center\">Learn More</Link>
          </div>
        </main>"""
repl = """            <Link href=\"/ai-assistant\" className=\"rounded-full border border-white/15 bg-black/25 px-5 py-3 text-sm text-center backdrop-blur-sm hover:bg-black/40 transition-colors\">Learn More</Link>
          </div>
          {comingSoonNote ? (
            <p
              role=\"status\"
              className=\"mt-5 max-w-md mx-auto text-sm text-[color:var(--ai-muted)] leading-relaxed rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3\"
            >
              <span className=\"block text-white font-semibold mb-1\">AI Workspace</span>
              Coming soon - we are preparing the next generation of the Logic Intelligence Technologies AI experience.
            </p>
          ) : null}
        </main>"""
if needle in t and "comingSoonNote ?" not in t:
    t = t.replace(needle, repl)

# Neutralize remaining auth entry if still present
if "router.push(\"/login?next=/ai\")" in t and "setComingSoonNote" in t:
    t = t.replace(
        """onClick={async () => {
                // Require auth before entering the chat workspace
                const { data } = await supabase.auth.getUser();
                if (!data.user) {
                  router.push(\"/login?next=/ai\");
                  return;
                }
                setLanded(false);
              }}""",
        "onClick={() => setComingSoonNote(true)}",
    )

p.write_text(t)
print("AI done", "Coming Soon" in t, "Get Started left", t.count("Get Started"))
