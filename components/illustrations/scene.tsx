type SceneVariant = "network" | "delivery" | "travel" | "growth";

const SCENE_BG: Record<SceneVariant, string> = {
  network: "linear-gradient(135deg, #f5eff4 0%, #ffffff 60%)",
  delivery: "linear-gradient(135deg, #e6f5f5 0%, #ffffff 60%)",
  travel: "linear-gradient(160deg, #3d2837 0%, #604058 55%, #714b67 100%)",
  growth: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 60%)",
};

function DotGrid({ light }: { light?: boolean }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle, ${light ? "rgba(255,255,255,0.18)" : "rgba(17,24,39,0.08)"} 1.5px, transparent 1.5px)`,
        backgroundSize: "18px 18px",
      }}
    />
  );
}

/** Small reusable side-view truck glyph reused wherever a scene needs to
 * point literally at "Instanta Logistics" rather than an abstract node. */
function TruckGlyph({ x, y, scale = 1, color = "#017e84" }: { x: number; y: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <rect x="0" y="4" width="28" height="16" rx="2.5" fill={color} />
      <path d="M28 8 h9 l7 8 v4 h-16 z" fill={color} opacity="0.8" />
      <rect x="31" y="11" width="7" height="5" rx="1" fill="#ffffff" fillOpacity="0.55" />
      <circle cx="8" cy="22" r="3.6" fill="#252733" />
      <circle cx="8" cy="22" r="1.4" fill="#e6e9ed" />
      <circle cx="33" cy="22" r="3.6" fill="#252733" />
      <circle cx="33" cy="22" r="1.4" fill="#e6e9ed" />
    </g>
  );
}

/** Small reusable airplane glyph (climbing, 3/4 silhouette). */
function PlaneGlyph({ x, y, scale = 1, rotate = -28, color = "#ffffff" }: { x: number; y: number; scale?: number; rotate?: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale}) rotate(${rotate})`}>
      <path
        d="M0 6 L34 0 L44 10 L30 12 L26 24 L18 22 L19 10 L2 12 Z"
        fill={color}
      />
    </g>
  );
}

function NetworkArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      {/* route lines from each live business into the group hub */}
      <path d="M62 226 C 110 196, 150 176, 196 160" stroke="#99c9c9" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      <path d="M210 150 C 260 120, 300 96, 338 70" stroke="#d4bccd" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      {/* future-business nodes */}
      <circle cx="70" cy="88" r="5" fill="none" stroke="#b9a7b4" strokeWidth="2" />
      <path d="M70 84 v8 M66 88 h8" stroke="#b9a7b4" strokeWidth="2" strokeLinecap="round" />
      <circle cx="342" cy="232" r="5" fill="none" stroke="#9cc9c8" strokeWidth="2" />
      <path d="M342 228 v8 M338 232 h8" stroke="#9cc9c8" strokeWidth="2" strokeLinecap="round" />
      {/* group hub */}
      <rect x="178" y="128" width="44" height="44" rx="12" fill="#ffffff" stroke="#714b67" strokeWidth="2.5" />
      <path d="M190 150 l7 7 15 -17" stroke="#714b67" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* logistics node */}
      <circle cx="46" cy="232" r="26" fill="#e6f5f5" />
      <TruckGlyph x={27} y={220} scale={0.72} color="#017e84" />
      {/* travels node */}
      <circle cx="356" cy="64" r="26" fill="#f5eff4" />
      <g transform="translate(340,50)">
        <PlaneGlyph x={0} y={0} scale={0.42} rotate={-18} color="#714b67" />
      </g>
    </svg>
  );
}

function DeliveryArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      <ellipse cx="195" cy="245" rx="150" ry="14" fill="#d8f0ef" />
      {/* speed lines */}
      <path d="M18 165 h34 M10 185 h46 M22 205 h30" stroke="#b3e0df" strokeWidth="5" strokeLinecap="round" />
      {/* cargo box + cab */}
      <rect x="80" y="140" width="130" height="80" rx="10" fill="#017e84" />
      <rect x="95" y="160" width="40" height="36" rx="6" fill="#ffffff" fillOpacity="0.85" />
      <path d="M100 178 h30 M115 165 v26" stroke="#017e84" strokeWidth="3" strokeLinecap="round" />
      <rect x="210" y="165" width="70" height="55" rx="8" fill="#02a3a8" />
      <path d="M280 175 h28 l20 24 v16 h-48 z" fill="#5a3c52" />
      <rect x="291" y="187" width="15" height="12" rx="2" fill="#f5eff4" fillOpacity="0.8" />
      <circle cx="140" cy="228" r="18" fill="#252733" />
      <circle cx="140" cy="228" r="7" fill="#e6e9ed" />
      <circle cx="265" cy="228" r="18" fill="#252733" />
      <circle cx="265" cy="228" r="7" fill="#e6e9ed" />
      {/* destination pin ahead of the van */}
      <g transform="translate(345,150)">
        <path d="M0 0 C -14 0 -14 22 0 34 C 14 22 14 0 0 0 Z" fill="#714b67" />
        <circle cx="0" cy="13" r="5.5" fill="#ffffff" />
      </g>
      {/* delivered badge */}
      <circle cx="40" cy="60" r="26" fill="#f5eff4" />
      <path d="M28 60 l8 8 16 -18" stroke="#714b67" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function TravelArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      {/* night sky */}
      <circle cx="80" cy="50" r="1.5" fill="#ffffff" fillOpacity="0.6" />
      <circle cx="140" cy="34" r="1.5" fill="#ffffff" fillOpacity="0.5" />
      <circle cx="300" cy="40" r="2" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="250" cy="80" r="1.5" fill="#ffffff" fillOpacity="0.5" />
      <circle cx="360" cy="120" r="1.5" fill="#ffffff" fillOpacity="0.6" />
      {/* soft clouds */}
      <ellipse cx="95" cy="110" rx="26" ry="9" fill="#ffffff" fillOpacity="0.08" />
      <ellipse cx="310" cy="170" rx="34" ry="10" fill="#ffffff" fillOpacity="0.07" />
      {/* flight path between two cities */}
      <path
        d="M46 222 C 120 182, 180 160, 220 150 S 300 110, 362 64"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="2.5"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      {/* departure / arrival pins */}
      <g transform="translate(46,222)">
        <path d="M0 -24 C -11 -24 -11 -6 0 6 C 11 -6 11 -24 0 -24 Z" fill="#02a3a8" />
        <circle cx="0" cy="-15" r="4.5" fill="#ffffff" />
      </g>
      <g transform="translate(362,64)">
        <path d="M0 -24 C -11 -24 -11 -6 0 6 C 11 -6 11 -24 0 -24 Z" fill="#02a3a8" />
        <circle cx="0" cy="-15" r="4.5" fill="#ffffff" />
      </g>
      {/* the aircraft, banking along the route */}
      <PlaneGlyph x={205} y={145} scale={0.95} rotate={-28} color="#ffffff" />
      {/* boarding pass motif */}
      <g transform="translate(272,208)">
        <rect x="0" y="0" width="86" height="40" rx="7" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" strokeOpacity="0.3" />
        <line x1="58" y1="4" x2="58" y2="36" stroke="#ffffff" strokeOpacity="0.3" strokeDasharray="2 3" />
        <circle cx="70" cy="20" r="7" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.4" />
        <path d="M66 20 h8 M70 16 v8" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.2" />
        <path d="M10 13 h30 M10 21 h22 M10 29 h26" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function GrowthArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      <ellipse cx="170" cy="255" rx="190" ry="8" fill="#eee2ea" />
      {/* bars: alternating logistics / travels contribution */}
      <rect x="60" y="190" width="36" height="60" rx="6" fill="#99c9c9" />
      <rect x="112" y="150" width="36" height="100" rx="6" fill="#d4bccd" />
      <rect x="164" y="110" width="36" height="140" rx="6" fill="#017e84" />
      <rect x="216" y="160" width="36" height="90" rx="6" fill="#714b67" />
      <path d="M60 170 L112 130 L164 90 L216 135 L270 70" stroke="#5a3c52" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="270" cy="70" r="6.5" fill="#5a3c52" />
      {/* the two businesses feeding the trend */}
      <circle cx="326" cy="56" r="27" fill="#e6f5f5" />
      <TruckGlyph x={307} y={45} scale={0.68} color="#017e84" />
      <circle cx="340" cy="186" r="22" fill="#f5eff4" />
      <g transform="translate(327,174)">
        <PlaneGlyph x={0} y={0} scale={0.46} rotate={-18} color="#714b67" />
      </g>
    </svg>
  );
}

const SCENE_ART: Record<SceneVariant, () => React.JSX.Element> = {
  network: NetworkArt,
  delivery: DeliveryArt,
  travel: TravelArt,
  growth: GrowthArt,
};

export function Scene({
  variant,
  className,
}: {
  variant: SceneVariant;
  className?: string;
}) {
  const Art = SCENE_ART[variant];
  return (
    <div className={className} style={{ background: SCENE_BG[variant] }}>
      <div className="relative w-full h-full">
        <DotGrid light={variant === "travel"} />
        <Art />
      </div>
    </div>
  );
}
