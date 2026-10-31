interface Props {
  className?: string;
}

/**
 * Galata Tower — minimal monoline icon.
 * Tall-format illustration, designed as a side/footer decoration.
 * Apply opacity and sizing via className.
 */
export default function GalataTower({ className }: Props) {
  return (
    <svg
      viewBox="0 0 160 310"
      fill="none"
      stroke="var(--brand)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* ── Ground ───────────────────────────────────────────────────────── */}
      <line x1="20" y1="296" x2="140" y2="296" strokeOpacity="0.5" />

      {/* ── Foundation steps ─────────────────────────────────────────────── */}
      <path d="M 32,296 L 32,282 L 128,282 L 128,296" />
      <path d="M 38,282 L 38,272 L 122,272 L 122,282" />

      {/* ── Main tower body (slight taper: wider at base) ─────────────────── */}
      {/* Left edge tapers from x=44 at top to x=40 at bottom */}
      <path d="M 44,135 L 40,272 M 116,135 L 120,272" />
      {/* Cap lines top and bottom of body */}
      <line x1="44" y1="135" x2="116" y2="135" />
      <line x1="40" y1="272" x2="120" y2="272" />

      {/* Stone banding — horizontal rings on body */}
      <line x1="41" y1="176" x2="119" y2="176" />
      <line x1="41" y1="218" x2="119" y2="218" />
      <line x1="42" y1="248" x2="118" y2="248" />

      {/* Arched windows on main body (pairs per level) */}
      {/* Level 1 (y≈195-210) */}
      <path d="M 52,210 Q 58,198 64,210" />
      <path d="M 96,210 Q 102,198 108,210" />
      {/* Level 2 (y≈234-248) */}
      <path d="M 53,246 Q 59,234 65,246" />
      <path d="M 95,246 Q 101,234 107,246" />
      {/* Level 3 (y≈258-272) */}
      <path d="M 54,268 Q 59,258 64,268" />
      <path d="M 96,268 Q 101,258 106,268" />

      {/* ── Gallery / observation deck ────────────────────────────────────── */}
      {/* Protruding balcony ring */}
      <path d="M 34,120 L 34,136 L 126,136 L 126,120" />
      <line x1="34" y1="120" x2="126" y2="120" />
      {/* Balcony railing posts (small verticals) */}
      {[44, 56, 68, 80, 92, 104, 116].map((x) => (
        <line key={x} x1={x} y1="120" x2={x} y2="130" />
      ))}
      {/* Balcony railing top */}
      <line x1="36" y1="122" x2="124" y2="122" />

      {/* ── Upper section above gallery ───────────────────────────────────── */}
      <path d="M 46,80 L 46,120 M 114,80 L 114,120" />
      <line x1="46" y1="80" x2="114" y2="80" />
      {/* Arched windows on upper section */}
      <path d="M 56,112 Q 62,102 68,112" />
      <path d="M 92,112 Q 98,102 104,112" />
      <path d="M 56,95 Q 62,85 68,95" />
      <path d="M 92,95 Q 98,85 104,95" />

      {/* ── Conical roof ─────────────────────────────────────────────────── */}
      <polyline points="44,80 80,22 116,80" />
      {/* Roof ribs (subtle lines from peak to base) */}
      <line x1="80" y1="22" x2="62" y2="80" strokeOpacity="0.4" />
      <line x1="80" y1="22" x2="98" y2="80" strokeOpacity="0.4" />

      {/* ── Finial / flag pole ────────────────────────────────────────────── */}
      <line x1="80" y1="22" x2="80" y2="8" />
      <circle cx="80" cy="6" r="2.5" />

      {/* ── Crescent decorations on tower (subtle arcs) ───────────────────── */}
      <path d="M 72,155 Q 80,148 88,155" strokeOpacity="0.5" />
    </svg>
  );
}
