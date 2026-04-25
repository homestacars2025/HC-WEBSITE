interface Props {
  className?: string;
}

/**
 * Bosphorus (15 July Martyrs) Bridge — minimal suspension bridge outline.
 * Wide-format illustration, designed as a horizontal decorative divider.
 * Apply opacity and sizing via className.
 */
export default function BosphorusBridge({ className }: Props) {
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
      {/* ── Water / sea surface ──────────────────────────────────────────── */}
      <path d="M 0,168 Q 80,163 160,168 Q 240,173 320,168 Q 400,163 480,168 Q 560,173 640,168" strokeOpacity="0.4" />
      <path d="M 0,178 Q 80,173 160,178 Q 240,183 320,178 Q 400,173 480,178 Q 560,183 640,178" strokeOpacity="0.25" />
      <path d="M 0,188 Q 80,184 160,188 Q 240,192 320,188 Q 400,184 480,188 Q 560,192 640,188" strokeOpacity="0.15" />

      {/* ── Road deck ────────────────────────────────────────────────────── */}
      <line x1="0" y1="148" x2="640" y2="148" />
      {/* Centre line (dashed) */}
      <line x1="40" y1="148" x2="600" y2="148" strokeDasharray="12 8" strokeOpacity="0.3" />

      {/* ── Left tower ───────────────────────────────────────────────────── */}
      {/* Left post */}
      <line x1="162" y1="42" x2="162" y2="148" />
      {/* Right post */}
      <line x1="178" y1="42" x2="178" y2="148" />
      {/* Cross beam */}
      <rect x="156" y="82" width="28" height="10" rx="1" />
      {/* Top cap */}
      <rect x="156" y="42" width="28" height="8" rx="1" />

      {/* ── Right tower ──────────────────────────────────────────────────── */}
      <line x1="462" y1="42" x2="462" y2="148" />
      <line x1="478" y1="42" x2="478" y2="148" />
      <rect x="456" y="82" width="28" height="10" rx="1" />
      <rect x="456" y="42" width="28" height="8" rx="1" />

      {/* ── Main suspension cable ────────────────────────────────────────── */}
      {/*
        From left anchorage (20,158) → rises to left tower top (170,46) →
        catenary sag to (320,100) → rises to right tower top (470,46) →
        descends to right anchorage (620,158)
      */}
      <path d="M 20,158 L 170,46 Q 320,152 470,46 L 620,158" />

      {/* ── Vertical hangers (suspenders) ────────────────────────────────── */}
      {/*
        y values on the bezier M170,46 Q320,152 470,46 :
        CP=(320,152); at t: x=(1-t)²·170 + 2t(1-t)·320 + t²·470
                           y=(1-t)²·46 + 2t(1-t)·152 + t²·46
        t≈0.10 → x≈188, y≈66    t≈0.22 → x≈222, y≈88
        t≈0.35 → x≈259, y≈105   t≈0.50 → x≈320, y≈120
        (symmetric for t>0.5)
      */}
      <line x1="192" y1="65" x2="192" y2="148" />
      <line x1="218" y1="86" x2="218" y2="148" />
      <line x1="248" y1="100" x2="248" y2="148" />
      <line x1="280" y1="112" x2="280" y2="148" />
      <line x1="320" y1="120" x2="320" y2="148" />
      <line x1="360" y1="112" x2="360" y2="148" />
      <line x1="392" y1="100" x2="392" y2="148" />
      <line x1="422" y1="86" x2="422" y2="148" />
      <line x1="448" y1="65" x2="448" y2="148" />

      {/* ── Approach road embankments ─────────────────────────────────────── */}
      <line x1="0" y1="148" x2="0" y2="168" />
      <line x1="640" y1="148" x2="640" y2="168" />
      <path d="M 0,148 Q 40,146 80,148" strokeOpacity="0.4" />
      <path d="M 560,148 Q 600,146 640,148" strokeOpacity="0.4" />
    </svg>
  );
}
