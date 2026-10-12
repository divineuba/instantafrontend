type SceneVariant = "network" | "delivery" | "travel" | "growth" | "auth" | "horizon" | "crypto" | "love";

const SCENE_BG: Record<SceneVariant, string> = {
  network: "linear-gradient(135deg, #f5eff4 0%, #ffffff 60%)",
  delivery: "linear-gradient(135deg, #e6f5f5 0%, #ffffff 60%)",
  travel: "linear-gradient(160deg, #3d2837 0%, #604058 55%, #714b67 100%)",
  growth: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 60%)",
  auth: "linear-gradient(150deg, #241a21 0%, #4a2f3f 48%, #714b67 100%)",
  horizon: "linear-gradient(145deg, #eef6f5 0%, #f6eff4 55%, #ffffff 100%)",
  crypto: "linear-gradient(150deg, #1a2420 0%, #1f3a33 55%, #0f7a63 100%)",
  love: "linear-gradient(145deg, #2f1a22 0%, #5a2a3a 55%, #c2516f 100%)",
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
export function TruckGlyph({ x, y, scale = 1, color = "#017e84" }: { x: number; y: number; scale?: number; color?: string }) {
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

function AuthArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      {/* faint stars, matching the dark travel treatment */}
      <circle cx="70" cy="46" r="1.5" fill="#ffffff" fillOpacity="0.5" />
      <circle cx="330" cy="40" r="1.5" fill="#ffffff" fillOpacity="0.4" />
      <circle cx="300" cy="230" r="1.5" fill="#ffffff" fillOpacity="0.45" />
      {/* orbit lines from each business into the one secure account */}
      <path d="M94 212 C 130 196, 160 180, 188 166" stroke="#99c9c9" strokeOpacity="0.55" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      <path d="M212 134 C 250 112, 282 94, 312 78" stroke="#d4bccd" strokeOpacity="0.6" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      {/* logistics node */}
      <circle cx="66" cy="222" r="28" fill="#ffffff" fillOpacity="0.1" />
      <TruckGlyph x={47} y={210} scale={0.72} color="#02c7c7" />
      {/* travels node */}
      <circle cx="334" cy="66" r="28" fill="#ffffff" fillOpacity="0.1" />
      <g transform="translate(318,52)">
        <PlaneGlyph x={0} y={0} scale={0.42} rotate={-18} color="#ffffff" />
      </g>
      {/* one secure account hub */}
      <rect x="170" y="118" width="60" height="60" rx="16" fill="#ffffff" />
      <rect x="188" y="142" width="24" height="18" rx="3" fill="#714b67" />
      <path d="M192 142 v-8 a8 8 0 0 1 16 0 v8" stroke="#714b67" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="200" cy="150" r="2.2" fill="#ffffff" />
    </svg>
  );
}

function HorizonArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      {/* many paths radiating out from the group mark, toward live and future nodes */}
      <path d="M200 150 C 160 140, 110 128, 54 100" stroke="#99c9c9" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      <path d="M200 150 C 240 128, 290 100, 338 58" stroke="#d4bccd" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      <path d="M200 150 C 182 188, 158 222, 118 248" stroke="#c7ddd9" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />
      <path d="M200 150 C 228 182, 262 210, 308 228" stroke="#e3d3de" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />

      {/* future-business ghost nodes at the ends of the thinner paths */}
      <circle cx="104" cy="252" r="5" fill="none" stroke="#b9a7b4" strokeWidth="2" />
      <path d="M104 248 v8 M100 252 h8" stroke="#b9a7b4" strokeWidth="2" strokeLinecap="round" />
      <circle cx="322" cy="234" r="5" fill="none" stroke="#9cc9c8" strokeWidth="2" />
      <path d="M322 230 v8 M318 234 h8" stroke="#9cc9c8" strokeWidth="2" strokeLinecap="round" />

      {/* logistics node */}
      <circle cx="42" cy="92" r="24" fill="#e6f5f5" />
      <TruckGlyph x={24} y={81} scale={0.65} color="#017e84" />
      {/* travels node */}
      <circle cx="352" cy="50" r="24" fill="#f5eff4" />
      <g transform="translate(337,37)">
        <PlaneGlyph x={0} y={0} scale={0.4} rotate={-18} color="#714b67" />
      </g>

      {/* the group mark, at the centre every path moves out from */}
      <circle cx="200" cy="150" r="34" fill="#ffffff" stroke="#714b67" strokeWidth="2.5" />
      <circle cx="200" cy="150" r="21" fill="#714b67" fillOpacity="0.08" />
      <path d="M188 150 h24 M200 138 v24" stroke="#714b67" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CryptoArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      {/* faint candlestick ticker in the backdrop */}
      <path d="M20 220 h360" stroke="#5fcdb0" strokeOpacity="0.2" strokeWidth="1.5" />
      <path d="M20 180 h360" stroke="#5fcdb0" strokeOpacity="0.14" strokeWidth="1.5" />
      <path d="M20 140 h360" stroke="#5fcdb0" strokeOpacity="0.1" strokeWidth="1.5" />
      <g stroke="#5fcdb0" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round">
        <path d="M50 230 v-40 M50 190 h0" />
        <path d="M90 236 v-66" />
        <path d="M130 214 v-30" />
        <path d="M170 224 v-54" />
      </g>
      <rect x="44" y="196" width="12" height="20" rx="2" fill="#5fcdb0" fillOpacity="0.55" />
      <rect x="84" y="178" width="12" height="36" rx="2" fill="#5fcdb0" fillOpacity="0.55" />
      <rect x="124" y="188" width="12" height="20" rx="2" fill="#5fcdb0" fillOpacity="0.55" />
      <rect x="164" y="182" width="12" height="30" rx="2" fill="#5fcdb0" fillOpacity="0.55" />
      {/* upward trend line sweeping toward the coin */}
      <path d="M44 232 L96 192 L136 198 L176 176 L232 140 L288 108" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="288" cy="108" r="5" fill="#ffffff" />
      {/* the coin, centre stage */}
      <circle cx="300" cy="90" r="46" fill="#0f7a63" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2.5" />
      <circle cx="300" cy="90" r="33" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.6" />
      <path
        d="M292 68 v10 M292 102 v10 M300 64 c14 0 14 13 2 14 c13 1 13 14 -2 14 h-14 M296 68 h8 M296 112 h8"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function LoveArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      {/* soft ambient sparkle */}
      <circle cx="70" cy="56" r="1.6" fill="#ffffff" fillOpacity="0.55" />
      <circle cx="330" cy="48" r="1.6" fill="#ffffff" fillOpacity="0.45" />
      <circle cx="350" cy="220" r="1.6" fill="#ffffff" fillOpacity="0.4" />
      {/* two profile cards drifting toward a match */}
      <g transform="translate(60,96) rotate(-8)">
        <rect x="0" y="0" width="92" height="118" rx="14" fill="#ffffff" fillOpacity="0.14" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.6" />
        <circle cx="46" cy="42" r="20" fill="#ffffff" fillOpacity="0.3" />
        <rect x="18" y="76" width="56" height="8" rx="4" fill="#ffffff" fillOpacity="0.35" />
        <rect x="26" y="90" width="40" height="6" rx="3" fill="#ffffff" fillOpacity="0.22" />
      </g>
      <g transform="translate(246,88) rotate(7)">
        <rect x="0" y="0" width="92" height="118" rx="14" fill="#ffffff" fillOpacity="0.14" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.6" />
        <circle cx="46" cy="42" r="20" fill="#ffffff" fillOpacity="0.3" />
        <rect x="18" y="76" width="56" height="8" rx="4" fill="#ffffff" fillOpacity="0.35" />
        <rect x="26" y="90" width="40" height="6" rx="3" fill="#ffffff" fillOpacity="0.22" />
      </g>
      {/* connecting spark */}
      <path d="M152 150 C 175 130, 225 130, 248 150" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
      {/* the heart, centred where the cards meet */}
      <g transform="translate(200,168)">
        <path
          d="M0 20 C -26 -6 -46 10 -46 -12 C -46 -30 -24 -34 0 -10 C 24 -34 46 -30 46 -12 C 46 10 26 -6 0 20 Z"
          fill="#c2516f"
          stroke="#ffffff"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

const SCENE_ART: Record<SceneVariant, () => React.JSX.Element> = {
  network: NetworkArt,
  delivery: DeliveryArt,
  travel: TravelArt,
  growth: GrowthArt,
  auth: AuthArt,
  horizon: HorizonArt,
  crypto: CryptoArt,
  love: LoveArt,
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
        <DotGrid light={variant === "travel" || variant === "auth" || variant === "crypto" || variant === "love"} />
        <Art />
      </div>
    </div>
  );
}
