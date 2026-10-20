/** Original abstract SVG illustration â€” no third-party imagery required. */
export function HeroArt() {
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" role="img" aria-label="Illustration of managed services">
      <defs>
        <linearGradient id="hero-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2b66e6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#163da3" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="hero-g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8eb8ff" />
          <stop offset="100%" stopColor="#2b66e6" />
        </linearGradient>
      </defs>
      <rect x="150" y="170" width="200" height="160" rx="28" fill="url(#hero-g1)" />
      <rect x="150" y="170" width="200" height="160" rx="28" fill="none" stroke="white" strokeOpacity="0.2" />
      <g transform="translate(215 205)">
        <path d="M14 90V52a10 10 0 0 1 20 0v38" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M44 90V28" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M44 58c0-6 5-10 10-10h16" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="98" r="5" fill="#8eb8ff" />
      </g>
      <g>
        <line x1="250" y1="170" x2="250" y2="130" stroke="url(#hero-g2)" strokeWidth="3" strokeDasharray="6 6" />
        <circle cx="250" cy="100" r="30" className="fill-[rgb(var(--ayan-card))]" />
        <NodeIcon cx={250} cy={100} type="flame" />
      </g>
      <g>
        <line x1="350" y1="250" x2="395" y2="250" stroke="url(#hero-g2)" strokeWidth="3" strokeDasharray="6 6" />
        <circle cx="425" cy="250" r="30" className="fill-[rgb(var(--ayan-card))]" />
        <NodeIcon cx={425} cy={250} type="zap" />
      </g>
      <g>
        <line x1="250" y1="330" x2="250" y2="370" stroke="url(#hero-g2)" strokeWidth="3" strokeDasharray="6 6" />
        <circle cx="250" cy="400" r="30" className="fill-[rgb(var(--ayan-card))]" />
        <NodeIcon cx={250} cy={400} type="leaf" />
      </g>
      <g>
        <line x1="150" y1="250" x2="105" y2="250" stroke="url(#hero-g2)" strokeWidth="3" strokeDasharray="6 6" />
        <circle cx="75" cy="250" r="30" className="fill-[rgb(var(--ayan-card))]" />
        <NodeIcon cx={75} cy={250} type="shield" />
      </g>
    </svg>
  );
}

function NodeIcon({
  cx,
  cy,
  type,
}: {
  cx: number;
  cy: number;
  type: "flame" | "zap" | "leaf" | "shield";
}) {
  const color = "#2b66e6";
  const common = {
    stroke: color,
    strokeWidth: 2.2,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const shapes: Record<string, React.ReactNode> = {
    flame: (
      <g {...common}>
        <path d="M0 -12 C -6 -4 -10 0 -10 5 a10 10 0 0 0 20 0 c0-5-4-9-10-17 Z" />
      </g>
    ),
    zap: (
      <g {...common}>
        <path d="M-3 -13 L-10 2 L-1 2 L-4 13 L9 -3 L0 -3 Z" />
      </g>
    ),
    leaf: (
      <g {...common}>
        <path d="M-11 8 A11 11 0 0 1 0 -11 c8 0 11 4 11 4 0 8-4 11-11 11 Z" />
        <path d="M-11 11 c-1-4 0-7 3-9" />
      </g>
    ),
    shield: (
      <g {...common}>
        <path d="M0 -12 L10 -8 v6 c0 6-6 10-10 12 -4-2-10-6-10-12 v-6 Z" />
        <path d="M-4 0 L-1 3 L5 -3" />
      </g>
    ),
  };
  return <g transform={`translate(${cx} ${cy})`}>{shapes[type]}</g>;
}
