interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export default function SectionHeader({
  badge,
  badgeIcon,
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div className={`mb-16 md:mb-20 ${isCentered ? "text-center max-w-3xl mx-auto" : "text-left max-w-2xl"} ${className}`}>
      {badge && (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4`}>
          {badgeIcon}
          <span>{badge}</span>
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
