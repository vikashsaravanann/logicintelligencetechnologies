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
    <div className={`py-8 sm:py-12 ${className}`}>
      {(title || subtitle) && (
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          {title && (
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-[var(--lit-navy,#0B2545)] tracking-tight mb-3">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)]">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl border border-[#DFE7EF] bg-white p-6 transition-all duration-300 hover:border-[#1FA9A2]/40 hover:shadow-md shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold font-mono text-[#1FA9A2]/40 group-hover:text-[#1FA9A2] transition-colors">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="w-2 h-2 rounded-full bg-[#1FA9A2]/40 group-hover:bg-[#1FA9A2] transition-colors" />
            </div>
            <h4 className="text-base font-bold font-display text-[var(--lit-navy,#0B2545)] mb-2 group-hover:text-[var(--lit-blue,#1565C0)] transition-colors">
              {item.step}
            </h4>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
