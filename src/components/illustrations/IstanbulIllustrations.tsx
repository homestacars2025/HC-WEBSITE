// Istanbul landmark SVG illustrations — decorative, monoline, #4ba6ea

interface IllustrationProps {
  className?: string;
}

// ─── Hagia Sophia ─────────────────────────────────────────────────────────────
// Front-elevation silhouette: stepped building body + central dome + two minarets

export function HagiaSophia({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 480 278"
      fill="none"
      stroke="#4ba6ea"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Ground */}
      <line x1="0" y1="268" x2="480" y2="268" strokeOpacity="0.5" />

      {/* Left minaret — shaft + spire + balcony */}
      <line x1="78" y1="268" x2="78" y2="60" />
      <line x1="93" y1="268" x2="93" y2="60" />
      <polyline points="78,60 85.5,38 93,60" />
      <line x1="73" y1="106" x2="98" y2="106" />
      <line x1="73" y1="113" x2="98" y2="113" />
      <line x1="76" y1="72" x2="95" y2="72" />

      {/* Right minaret */}
      <line x1="387" y1="268" x2="387" y2="60" />
      <line x1="402" y1="268" x2="402" y2="60" />
      <polyline points="387,60 394.5,38 402,60" />
      <line x1="382" y1="106" x2="407" y2="106" />
      <line x1="382" y1="113" x2="407" y2="113" />
      <line x1="385" y1="72" x2="404" y2="72" />

      {/* Building body — stepped silhouette + dome arc as one path */}
      <path d="
        M 20,268 L 20,228
        L 93,228 L 93,195
        L 133,195 L 133,175
        L 150,162
        Q 240,60 330,162
        L 347,175 L 347,195
        L 387,195 L 387,228
        L 460,228 L 460,268
      " />

      {/* Drum base band */}
      <line x1="148" y1="162" x2="148" y2="176" />
      <line x1="332" y1="162" x2="332" y2="176" />
      <line x1="140" y1="176" x2="340" y2="176" />

      {/* Drum arched windows */}
      <path d="M 170,165 Q 176,155 182,165" />
      <path d="M 192,165 Q 198,155 204,165" />
      <path d="M 214,165 Q 220,155 226,165" />
      <path d="M 254,165 Q 260,155 266,165" />
      <path d="M 276,165 Q 282,155 288,165" />
      <path d="M 298,165 Q 304,155 310,165" />

      {/* Side semi-dome arches */}
      <path d="M 93,210 Q 93,168 150,166" />
      <path d="M 330,166 Q 387,168 387,210" />

      {/* Cornice lines on wing walls */}
      <line x1="20" y1="245" x2="93" y2="245" />
      <line x1="387" y1="245" x2="460" y2="245" />

      {/* Arched windows — base */}
      <path d="M 30,240 Q 36,229 42,240" />
      <path d="M 52,240 Q 58,229 64,240" />
      <path d="M 416,240 Q 422,229 428,240" />
      <path d="M 438,240 Q 444,229 450,240" />

      {/* Arched windows — wing walls */}
      <path d="M 30,218 Q 36,208 42,218" />
      <path d="M 52,218 Q 58,208 64,218" />
      <path d="M 418,218 Q 424,208 430,218" />
      <path d="M 440,218 Q 446,208 452,218" />
    </svg>
  );
}

// ─── Galata Tower ─────────────────────────────────────────────────────────────
// Cylindrical tower: body + gallery ring + conical roof + finial

export function GalataTower({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 310"
      fill="none"
      stroke="#4ba6ea"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Ground */}
      <line x1="20" y1="296" x2="140" y2="296" strokeOpacity="0.5" />

      {/* Foundation steps */}
      <path d="M 32,296 L 32,282 L 128,282 L 128,296" />
      <path d="M 38,282 L 38,272 L 122,272 L 122,282" />

      {/* Main tower body (slight taper) */}
      <path d="M 44,135 L 40,272 M 116,135 L 120,272" />
      <line x1="44" y1="135" x2="116" y2="135" />
      <line x1="40" y1="272" x2="120" y2="272" />

      {/* Stone banding */}
      <line x1="41" y1="176" x2="119" y2="176" />
      <line x1="41" y1="218" x2="119" y2="218" />
      <line x1="42" y1="248" x2="118" y2="248" />

      {/* Arched windows on body */}
      <path d="M 52,210 Q 58,198 64,210" />
      <path d="M 96,210 Q 102,198 108,210" />
      <path d="M 53,246 Q 59,234 65,246" />
      <path d="M 95,246 Q 101,234 107,246" />
      <path d="M 54,268 Q 59,258 64,268" />
      <path d="M 96,268 Q 101,258 106,268" />

      {/* Gallery / observation deck ring */}
      <path d="M 34,120 L 34,136 L 126,136 L 126,120" />
      <line x1="34" y1="120" x2="126" y2="120" />
      {[44, 56, 68, 80, 92, 104, 116].map((x) => (
        <line key={x} x1={x} y1="120" x2={x} y2="130" />
      ))}
      <line x1="36" y1="122" x2="124" y2="122" />

      {/* Upper section above gallery */}
      <path d="M 46,80 L 46,120 M 114,80 L 114,120" />
      <line x1="46" y1="80" x2="114" y2="80" />
      <path d="M 56,112 Q 62,102 68,112" />
      <path d="M 92,112 Q 98,102 104,112" />
      <path d="M 56,95 Q 62,85 68,95" />
      <path d="M 92,95 Q 98,85 104,95" />

      {/* Conical roof */}
      <polyline points="44,80 80,22 116,80" />
      <line x1="80" y1="22" x2="62" y2="80" strokeOpacity="0.4" />
      <line x1="80" y1="22" x2="98" y2="80" strokeOpacity="0.4" />

      {/* Finial */}
      <line x1="80" y1="22" x2="80" y2="8" />
      <circle cx="80" cy="6" r="2.5" />
    </svg>
  );
}

// ─── Bosphorus Wave ───────────────────────────────────────────────────────────
// Suspension bridge outline + water waves below

export function BosphorusWave({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 640 200"
      fill="none"
      stroke="#4ba6ea"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Water surface waves */}
      <path d="M 0,168 Q 80,163 160,168 Q 240,173 320,168 Q 400,163 480,168 Q 560,173 640,168" strokeOpacity="0.45" />
      <path d="M 0,178 Q 80,173 160,178 Q 240,183 320,178 Q 400,173 480,178 Q 560,183 640,178" strokeOpacity="0.28" />
      <path d="M 0,188 Q 80,184 160,188 Q 240,192 320,188 Q 400,184 480,188 Q 560,192 640,188" strokeOpacity="0.15" />

      {/* Road deck */}
      <line x1="0" y1="148" x2="640" y2="148" />

      {/* Left tower — two posts + crossbeam + cap */}
      <line x1="162" y1="42" x2="162" y2="148" />
      <line x1="178" y1="42" x2="178" y2="148" />
      <rect x="156" y="82" width="28" height="10" rx="1" />
      <rect x="156" y="42" width="28" height="8" rx="1" />

      {/* Right tower */}
      <line x1="462" y1="42" x2="462" y2="148" />
      <line x1="478" y1="42" x2="478" y2="148" />
      <rect x="456" y="82" width="28" height="10" rx="1" />
      <rect x="456" y="42" width="28" height="8" rx="1" />

      {/* Main suspension cable */}
      <path d="M 20,158 L 170,46 Q 320,152 470,46 L 620,158" />

      {/* Vertical hangers — y values computed on the cable bezier */}
      <line x1="192" y1="65" x2="192" y2="148" />
      <line x1="218" y1="86" x2="218" y2="148" />
      <line x1="248" y1="100" x2="248" y2="148" />
      <line x1="280" y1="112" x2="280" y2="148" />
      <line x1="320" y1="120" x2="320" y2="148" />
      <line x1="360" y1="112" x2="360" y2="148" />
      <line x1="392" y1="100" x2="392" y2="148" />
      <line x1="422" y1="86" x2="422" y2="148" />
      <line x1="448" y1="65" x2="448" y2="148" />
    </svg>
  );
}
