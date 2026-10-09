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

function NetworkArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      <path d="M40 230 C 100 180, 140 160, 200 150 S 300 110, 360 70" stroke="#d4bccd" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      <path d="M60 90 C 120 110, 160 140, 210 150 S 320 190, 350 230" stroke="#99c9c9" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      <circle cx="40" cy="230" r="9" fill="#017e84" />
      <circle cx="200" cy="150" r="13" fill="#714b67" />
      <circle cx="360" cy="70" r="9" fill="#017e84" />
      <circle cx="60" cy="90" r="7" fill="#8f6a85" />
      <circle cx="350" cy="230" r="7" fill="#8f6a85" />
      <rect x="182" y="132" width="36" height="36" rx="10" fill="#ffffff" stroke="#714b67" strokeWidth="2" />
      <path d="M192 150 l6 6 12 -14" stroke="#714b67" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function DeliveryArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      <ellipse cx="200" cy="245" rx="150" ry="14" fill="#d8f0ef" />
      <rect x="70" y="140" width="130" height="80" rx="10" fill="#017e84" />
      <rect x="200" y="165" width="70" height="55" rx="8" fill="#02a3a8" />
      <path d="M270 175 h28 l20 24 v16 h-48 z" fill="#5a3c52" />
      <circle cx="130" cy="228" r="18" fill="#252733" />
      <circle cx="130" cy="228" r="7" fill="#e6e9ed" />
      <circle cx="255" cy="228" r="18" fill="#252733" />
      <circle cx="255" cy="228" r="7" fill="#e6e9ed" />
      <rect x="95" y="160" width="40" height="36" rx="6" fill="#ffffff" fillOpacity="0.85" />
      <path d="M100 178 h30 M115 165 v26" stroke="#017e84" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 120 C 70 100, 100 95, 130 100" stroke="#b3e0df" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <path d="M22 70 l10 10 18 -20" stroke="#714b67" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(300,20)" />
      <circle cx="334" cy="44" r="26" fill="#f5eff4" />
      <path d="M322 44 l8 8 16 -18" stroke="#714b67" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function TravelArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      <circle cx="80" cy="60" r="1.5" fill="#ffffff" fillOpacity="0.6" />
      <circle cx="140" cy="40" r="1.5" fill="#ffffff" fillOpacity="0.5" />
      <circle cx="320" cy="50" r="2" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="260" cy="90" r="1.5" fill="#ffffff" fillOpacity="0.5" />
      <circle cx="350" cy="140" r="1.5" fill="#ffffff" fillOpacity="0.6" />
      <circle cx="60" cy="160" r="2" fill="#ffffff" fillOpacity="0.5" />
      <path
        d="M40 220 C 120 180, 180 160, 220 150 S 300 110, 370 60"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="2.5"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      <g transform="translate(220,150) rotate(-28)">
        <path
          d="M0 0 l34 4 10 10 -14 2 -8 14 -8 -2 2 -14 -16 -6 6 -8 14 2z"
          fill="#ffffff"
        />
      </g>
      <circle cx="40" cy="220" r="6" fill="#02a3a8" />
      <circle cx="370" cy="60" r="6" fill="#02a3a8" />
      <ellipse cx="90" cy="250" rx="60" ry="6" fill="#ffffff" fillOpacity="0.08" />
      <ellipse cx="300" cy="230" rx="90" ry="8" fill="#ffffff" fillOpacity="0.06" />
    </svg>
  );
}

function GrowthArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" fill="none">
      <rect x="60" y="190" width="36" height="60" rx="6" fill="#d4bccd" />
      <rect x="112" y="150" width="36" height="100" rx="6" fill="#8f6a85" />
      <rect x="164" y="110" width="36" height="140" rx="6" fill="#714b67" />
      <rect x="216" y="160" width="36" height="90" rx="6" fill="#8f6a85" />
      <path d="M60 170 L112 130 L164 90 L216 135 L270 70" stroke="#017e84" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="270" cy="70" r="7" fill="#017e84" />
      <circle cx="320" cy="60" r="28" fill="#f5eff4" />
      <circle cx="320" cy="52" r="9" fill="#714b67" />
      <path d="M303 80 a17 17 0 0 1 34 0" fill="#714b67" />
      <circle cx="340" cy="190" r="20" fill="#e6f5f5" />
      <circle cx="340" cy="184" r="6.5" fill="#017e84" />
      <path d="M328 202 a12 12 0 0 1 24 0" fill="#017e84" />
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
