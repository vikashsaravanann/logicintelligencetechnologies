interface ProcessStep {
  step: string;
  desc: string;
}

interface ProcessTimelineProps {
  steps: ProcessStep[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ProcessTimeline({
  steps,
  title = "Our Engineering Process",
  subtitle = "Deterministic milestones from technical discovery through production deployment.",
  className = "",
}: ProcessTimelineProps) {
  return (
    <div className={`py-12 ${className}`}>
      {(title || subtitle) && (
        <div className="text-center max-w-3xl mx-auto mb-12">
          {title && <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">{title}</h3>}
          {subtitle && <p className="text-sm sm:text-base text-zinc-400">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black text-primary/30 group-hover:text-primary transition-colors">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
            </div>
            <h4 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">
              {item.step}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
