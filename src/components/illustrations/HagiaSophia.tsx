interface Props {
  className?: string;
}

/**
 * Hagia Sophia silhouette — minimal monoline line art.
 * Designed for use as a decorative background element.
 * Apply opacity and sizing via className.
 */
export default function HagiaSophia({ className }: Props) {
  return (
    <svg
      viewBox="0 0 480 278"
      fill="none"
      stroke="var(--brand)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* ── Ground line ─────────────────────────────────────────────────── */}
      <line x1="0" y1="268" x2="480" y2="268" strokeOpacity="0.6" />

      {/* ── Left minaret ────────────────────────────────────────────────── */}
      {/* Shaft */}
      <line x1="78" y1="268" x2="78" y2="60" />
      <line x1="93" y1="268" x2="93" y2="60" />
      {/* Spire */}
      <polyline points="78,60 85.5,38 93,60" />
      {/* Balcony shelves */}
      <line x1="73" y1="106" x2="98" y2="106" />
      <line x1="73" y1="113" x2="98" y2="113" />
      {/* Spire base ring */}
      <line x1="76" y1="72" x2="95" y2="72" />

      {/* ── Right minaret ───────────────────────────────────────────────── */}
      <line x1="387" y1="268" x2="387" y2="60" />
      <line x1="402" y1="268" x2="402" y2="60" />
      <polyline points="387,60 394.5,38 402,60" />
      <line x1="382" y1="106" x2="407" y2="106" />
      <line x1="382" y1="113" x2="407" y2="113" />
      <line x1="385" y1="72" x2="404" y2="72" />

      {/* ── Building body — stepped silhouette ──────────────────────────── */}
      {/*
        Outer base → left wing → shoulder → drum base
        Then dome arc spans the top
        Then right side mirrors back down to base
      */}
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

      {/* ── Drum (base band of central dome) ────────────────────────────── */}
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

      {/* ── Left semi-dome arch ──────────────────────────────────────────── */}
      <path d="M 93,210 Q 93,168 150,166" />

      {/* ── Right semi-dome arch ─────────────────────────────────────────── */}
      <path d="M 330,166 Q 387,168 387,210" />

      {/* ── Cornice lines on wing walls ──────────────────────────────────── */}
      <line x1="20" y1="245" x2="93" y2="245" />
      <line x1="387" y1="245" x2="460" y2="245" />

      {/* ── Arched windows on base section ───────────────────────────────── */}
      <path d="M 30,240 Q 36,229 42,240" />
      <path d="M 52,240 Q 58,229 64,240" />
      <path d="M 416,240 Q 422,229 428,240" />
      <path d="M 438,240 Q 444,229 450,240" />

      {/* ── Arched windows on wing walls ─────────────────────────────────── */}
      <path d="M 30,218 Q 36,208 42,218" />
      <path d="M 52,218 Q 58,208 64,218" />
      <path d="M 418,218 Q 424,208 430,218" />
      <path d="M 440,218 Q 446,208 452,218" />
    </svg>
  );
}
