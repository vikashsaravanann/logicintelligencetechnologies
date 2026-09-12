import { CheckCircle2 } from "lucide-react";

export interface FeatureItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface FeatureGridProps {
  features: (FeatureItem | string)[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function FeatureGrid({
  features,
  columns = 3,
  className = "",
}: FeatureGridProps) {
  const colClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid grid-cols-1 ${colClasses} gap-6 ${className}`}>
      {features.map((item, idx) => {
        const isString = typeof item === "string";
        const title = isString ? item : item.title;
        const description = isString ? "" : item.description;
        const icon = isString ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : item.icon;

        return (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-6 transition-all duration-300 hover:border-primary/40"
          >
            <div className="flex items-start gap-3">
              {icon && <div className="shrink-0">{icon}</div>}
              <div>
                <h4 className="text-base font-bold text-white mb-1">{title}</h4>
                {description && (
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
