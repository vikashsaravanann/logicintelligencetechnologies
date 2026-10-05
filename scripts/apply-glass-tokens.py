#!/usr/bin/env python3
from pathlib import Path

g = Path("src/app/globals.css")
gt = g.read_text()
if "--glass-bg:" not in gt:
    insert = """
  /* Glassmorphism design tokens */
  --glass-bg: rgba(12, 18, 32, 0.72);
  --glass-bg-strong: rgba(10, 15, 30, 0.88);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-blur: 16px;
  --glass-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  --glass-radius-lg: 1.5rem;
"""
    gt = gt.replace("  --ai-glow:", insert + "  --ai-glow:")
if ".glass-surface {" not in gt:
    gt += """
.glass-surface { background: var(--glass-bg, rgba(12,18,32,0.72)); border: 1px solid var(--glass-border, rgba(255,255,255,0.1)); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 1.5rem; box-shadow: 0 12px 40px rgba(0,0,0,0.35); }
.glass-surface-strong { background: rgba(10,15,30,0.9); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-radius: 1.5rem; }
.glass-nav { background: rgba(10,15,30,0.82); border-bottom: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-surface, .glass-surface-strong, .glass-nav { background: #0c1220; }
}
"""
g.write_text(gt)

n = Path("src/components/layout/navbar.tsx")
nt = n.read_text()
nt = nt.replace(
    '"bg-[rgba(10,15,30,0.85)] backdrop-blur-[20px] border-b border-white/[0.08] py-2.5"',
    '"glass-nav py-2.5"',
)
n.write_text(nt)
print("tokens+navbar ok")
