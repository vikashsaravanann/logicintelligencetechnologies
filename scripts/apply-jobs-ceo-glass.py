#!/usr/bin/env python3
from pathlib import Path

p = Path("src/app/(marketing)/jobs/jobs-client.tsx")
t = p.read_text()
start = t.find("      {/* Featured CEO Card */}")
end = t.find("      {/* Director Seats (3 Cards) */}")
if start < 0 or end < 0:
    raise SystemExit(f"CEO markers missing start={start} end={end}")

new_block = '''      {/* Featured CEO Card - half image / half glass content */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-14">
        <article className="relative isolate overflow-hidden rounded-[32px] border border-white/12 shadow-[0_30px_90px_rgba(0,0,0,0.55)] bg-[#0A0F1E]">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] lg:min-h-[560px]">
            <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-full order-1">
              <Image src={featured.cover!} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" quality={75} className="object-cover object-center" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0A0F1E]/40" />
              <div className="absolute top-5 left-5 z-20">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] rounded-full border border-cyan-300/40 bg-black/65 backdrop-blur-md px-3.5 py-1 text-cyan-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden />
                  Priority Role - Open Seat
                </span>
              </div>
            </div>
            <div className="relative z-10 order-2 flex flex-col justify-center p-6 sm:p-9 lg:p-11 bg-[rgba(10,15,30,0.94)] lg:bg-[rgba(10,15,30,0.92)] border-t lg:border-t-0 lg:border-l border-white/10 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">Executive Appointment</span>
                <span className="text-zinc-600" aria-hidden>|</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">Coimbatore HQ</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight uppercase text-white leading-[1.15] mb-4">{featured.t}</h3>
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed mb-5 max-w-prose">{featured.d}</p>
              <div className="space-y-3 mb-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] block mb-1">Ideal Profile</span>
                  {featured.who}
                </p>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] block mb-1">Location Requirement</span>
                  {featured.extra}
                </p>
              </div>
              <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-3 rounded-xl border border-cyan-400/25 bg-cyan-950/50 mb-6 max-w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 shrink-0">Terms</span>
                <span className="text-xs font-semibold text-white uppercase tracking-wide">{featured.salary} - {featured.equity}</span>
              </div>
              <div className="space-y-2 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">90-Day Ownership Goals</p>
                <div className="grid gap-2">
                  {featured.days.map((d) => (
                    <div key={d} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs font-semibold text-zinc-100 tracking-wide flex items-start gap-2">
                      <span className="text-cyan-400 font-bold shrink-0" aria-hidden>-</span>
                      <span className="normal-case sm:uppercase">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => goApply("ceo")} className="h-12 px-8 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-[0.16em] w-full sm:w-auto shadow-[0_10px_30px_rgba(0,191,255,0.28)] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all">
                Apply for CEO Seat
              </button>
            </div>
          </div>
        </article>
      </section>

'''

p.write_text(t[:start] + new_block + t[end:])
print("CEO rewritten")
