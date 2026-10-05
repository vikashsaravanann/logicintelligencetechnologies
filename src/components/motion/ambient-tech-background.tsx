/**
 * Site-wide tech ambient layer (procedural, no video/WebGL):
 * - masked engineering grid
 * - low-opacity network geometry that drifts very slowly
 * - two soft turquoise/azure light fields
 * - dark navy scrims so text never washes out
 *
 * Pure CSS/SVG: transform/opacity animations only, pointer-events none,
 * and fully static under prefers-reduced-motion (see styles/ambient.css).
 * Node positions come from a fixed seed so server and client markup match.
 */

type Node = { x: number; y: number };

const W = 1600;
const H = 1000;

function buildNetwork(count: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const nodes: Node[] = Array.from({ length: count }, () => ({
    x: Math.round(rand() * W),
    y: Math.round(rand() * H),
  }));
  const edges = new Set<string>();
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  return {
    nodes,
    edges: [...edges].map((k) => k.split("-").map(Number) as [number, number]),
  };
}

const NETWORK = buildNetwork(34, 20261005);

export default function AmbientTechBackground({
  opacity = 0.3,
}: {
  opacity?: number;
}) {
  // `opacity` historically scaled the video; it now scales the decorative layers.
  const intensity = Math.min(1, Math.max(0, opacity * 2.5));

  return (
    <div className="lit-ambient pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#0A0F1E]" />

      <div className="absolute inset-0" style={{ opacity: intensity }}>
        <div className="lit-ambient-grid absolute inset-0" />

        <svg
          className="lit-ambient-net absolute inset-0 h-full w-full"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <g stroke="rgba(8,148,222,0.22)" strokeWidth="1" fill="none">
            {NETWORK.edges.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={NETWORK.nodes[a].x}
                y1={NETWORK.nodes[a].y}
                x2={NETWORK.nodes[b].x}
                y2={NETWORK.nodes[b].y}
              />
            ))}
          </g>
          <g fill="rgba(69,217,210,0.55)">
            {NETWORK.nodes.map((n, i) => (
              <circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={i % 5 === 0 ? 2.6 : 1.6}
                className={i % 5 === 0 ? "lit-ambient-node" : undefined}
                style={i % 5 === 0 ? { animationDelay: `${(i % 7) * 1.3}s` } : undefined}
              />
            ))}
          </g>
        </svg>

        <div className="lit-ambient-light lit-ambient-light-a absolute" />
        <div className="lit-ambient-light lit-ambient-light-b absolute" />
      </div>

      <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-primary/10 blur-[90px] sm:h-72 sm:w-72" />
      <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-accent/10 blur-[100px] sm:h-80 sm:w-80" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-primary/5 blur-[90px]" />

      <div className="absolute inset-0 bg-[#0A0F1E]/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/30 via-[#0A0F1E]/40 to-[#0A0F1E]/80" />
    </div>
  );
}
