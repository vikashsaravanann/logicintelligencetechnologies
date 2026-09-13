/**
 * Unique geometric visual per page — no stock photos, no fabricated people.
 */
export default function BrandMesh({
  seed = "lit",
  accent = "#00BFFF",
  secondary = "#7B2FBE",
  label,
  className = "",
}: {
  seed?: string;
  accent?: string;
  secondary?: string;
  label?: string;
  className?: string;
}) {
  const n = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rot = (n % 24) - 12;
  const ox = 40 + (n % 80);
  const oy = 30 + ((n * 3) % 60);

  return (
    <svg
      viewBox="0 0 640 420"
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label={label || "Logic Intelligence Technologies visual"}
    >
      <defs>
        <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`r-${seed}`} cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0A0F1E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="420" fill="#070B16" />
      <rect width="640" height="420" fill={`url(#r-${seed})`} />
      <g opacity="0.35" stroke={accent} strokeWidth="0.6">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={40 + i * 70} y1="20" x2={40 + i * 70} y2="400" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="20" y1={30 + i * 64} x2="620" y2={30 + i * 64} />
        ))}
      </g>
      <g transform={`translate(${ox} ${oy}) rotate(${rot} 240 160)`}>
        <rect x="80" y="70" width="280" height="180" rx="18" fill="none" stroke={`url(#g-${seed})`} strokeWidth="1.6" />
        <rect x="120" y="108" width="200" height="104" rx="12" fill={`${accent}22`} stroke={accent} strokeWidth="1" />
        <circle cx="220" cy="160" r="28" fill="none" stroke={secondary} strokeWidth="2" />
        <circle cx="220" cy="160" r="8" fill={accent} />
      </g>
      {label ? (
        <text x="40" y="392" fill="#E8EEF7" fontSize="14" fontFamily="Inter, system-ui, sans-serif" letterSpacing="2">
          {label.toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
}
