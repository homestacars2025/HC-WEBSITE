/**
 * Istanbul landmark SVG illustrations.
 * Stroke-only, no fill. Color applied via CSS (currentColor or direct stroke).
 * Size and opacity controlled entirely via className.
 */

interface Props {
  className?: string;
}

// ─── Hagia Sophia ─────────────────────────────────────────────────────────────
// Front elevation: wide stepped body + large central dome + two minarets

export function HagiaSophia({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 310"
      fill="none"
      stroke="#4ba6ea"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* ── Ground ─────────────────────────────────────────────────────── */}
      <line x1="0" y1="298" x2="520" y2="298" strokeOpacity="0.4" />

      {/* ── Left minaret ────────────────────────────────────────────────── */}
      <line x1="82"  y1="298" x2="82"  y2="62" />
      <line x1="97"  y1="298" x2="97"  y2="62" />
      <polyline points="82,62 89.5,40 97,62" />
      {/* Spire base ring */}
      <line x1="80"  y1="74"  x2="99"  y2="74" />
      {/* Balcony */}
      <line x1="77"  y1="115" x2="102" y2="115" />
      <line x1="79"  y1="122" x2="100" y2="122" />
      {/* Small windows on shaft */}
      <path d="M 85,145 Q 89.5,137 94,145" />
      <path d="M 85,165 Q 89.5,157 94,165" />
      <path d="M 85,185 Q 89.5,177 94,185" />

      {/* ── Right minaret ───────────────────────────────────────────────── */}
      <line x1="423" y1="298" x2="423" y2="62" />
      <line x1="438" y1="298" x2="438" y2="62" />
      <polyline points="423,62 430.5,40 438,62" />
      <line x1="421" y1="74"  x2="440" y2="74" />
      <line x1="418" y1="115" x2="443" y2="115" />
      <line x1="420" y1="122" x2="441" y2="122" />
      <path d="M 426,145 Q 430.5,137 435,145" />
      <path d="M 426,165 Q 430.5,157 435,165" />
      <path d="M 426,185 Q 430.5,177 435,185" />

      {/* ── Building body — stepped silhouette ──────────────────────────── */}
      {/* Full outline: base → left steps → dome arc → right steps → base */}
      <path d="
        M 18,298 L 18,248
        L 82,248  L 82,215
        L 118,215 L 118,192
        L 148,192 L 148,172
        L 162,162
        Q 260,52 358,162
        L 372,172 L 372,192
        L 402,192 L 402,215
        L 438,215 L 438,248
        L 502,248 L 502,298
      " />

      {/* ── Drum band ───────────────────────────────────────────────────── */}
      <line x1="155" y1="162" x2="155" y2="178" />
      <line x1="365" y1="162" x2="365" y2="178" />
      <line x1="146" y1="178" x2="374" y2="178" />

      {/* Drum arched windows (6 evenly spaced) */}
      {[175, 198, 221, 279, 302, 325].map((x) => (
        <path key={x} d={`M ${x},165 Q ${x + 11.5},154 ${x + 23},165`} />
      ))}

      {/* ── Left semi-dome arch ──────────────────────────────────────────── */}
      <path d="M 118,228 Q 118,182 162,178" />

      {/* ── Right semi-dome arch ─────────────────────────────────────────── */}
      <path d="M 358,178 Q 402,182 402,228" />

      {/* ── Cornice lines ────────────────────────────────────────────────── */}
      <line x1="18"  y1="268" x2="82"  y2="268" />
      <line x1="438" y1="268" x2="502" y2="268" />

      {/* ── Arched windows on base walls ─────────────────────────────────── */}
      {[28, 50].map((x) => (
        <path key={x} d={`M ${x},262 Q ${x + 8},250 ${x + 16},262`} />
      ))}
      {[454, 476].map((x) => (
        <path key={x} d={`M ${x},262 Q ${x + 8},250 ${x + 16},262`} />
      ))}

      {/* ── Arched windows on stepped wings ─────────────────────────────── */}
      {[28, 50].map((x) => (
        <path key={x + 'w'} d={`M ${x},240 Q ${x + 8},228 ${x + 16},240`} />
      ))}
      {[454, 476].map((x) => (
        <path key={x + 'w'} d={`M ${x},240 Q ${x + 8},228 ${x + 16},240`} />
      ))}

      {/* ── Large arched windows on main body ───────────────────────────── */}
      <path d="M 130,212 Q 143,195 156,212" />
      <path d="M 364,212 Q 377,195 390,212" />
    </svg>
  );
}

// ─── Galata Tower ─────────────────────────────────────────────────────────────
// Cylindrical body with gallery ring, conical roof, and finial

export function GalataTower({ className }: Props) {
  return (
    <svg
      viewBox="0 0 160 340"
      fill="none"
      stroke="#4ba6ea"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* ── Ground ───────────────────────────────────────────────────────── */}
      <line x1="14" y1="325" x2="146" y2="325" strokeOpacity="0.4" />

      {/* ── Foundation (two stepped levels) ──────────────────────────────── */}
      <path d="M 26,325 L 26,310 L 134,310 L 134,325" />
      <path d="M 33,310 L 33,298 L 127,298 L 127,310" />

      {/* ── Tower body (tapers slightly from bottom to top) ───────────────── */}
      {/* Sides */}
      <line x1="43"  y1="152" x2="38"  y2="298" />
      <line x1="117" y1="152" x2="122" y2="298" />
      {/* Top and bottom caps */}
      <line x1="43"  y1="152" x2="117" y2="152" />
      <line x1="38"  y1="298" x2="122" y2="298" />

      {/* ── Stone banding (horizontal rings on body) ─────────────────────── */}
      <line x1="40" y1="192" x2="120" y2="192" />
      <line x1="39" y1="232" x2="121" y2="232" />
      <line x1="39" y1="268" x2="121" y2="268" />

      {/* ── Arched windows — lower level ─────────────────────────────────── */}
      <path d="M 51,278 Q 58,266 65,278" />
      <path d="M 95,278 Q 102,266 109,278" />
      {/* Mid level */}
      <path d="M 51,246 Q 58,234 65,246" />
      <path d="M 95,246 Q 102,234 109,246" />
      {/* Upper level */}
      <path d="M 51,208 Q 58,196 65,208" />
      <path d="M 95,208 Q 102,196 109,208" />

      {/* ── Gallery / observation deck ────────────────────────────────────── */}
      {/* Main ring protrudes ~8px each side */}
      <path d="M 33,138 L 33,154 L 127,154 L 127,138" />
      <line x1="33" y1="138" x2="127" y2="138" />
      {/* Railing posts */}
      {[43, 55, 67, 80, 93, 105, 117].map((x) => (
        <line key={x} x1={x} y1="138" x2={x} y2="148" />
      ))}
      {/* Top railing line */}
      <line x1="35" y1="140" x2="125" y2="140" />

      {/* ── Upper section (above gallery) ────────────────────────────────── */}
      <line x1="45"  y1="90"  x2="45"  y2="138" />
      <line x1="115" y1="90"  x2="115" y2="138" />
      <line x1="45"  y1="90"  x2="115" y2="90" />
      {/* Upper windows */}
      <path d="M 55,128 Q 62,116 69,128" />
      <path d="M 91,128 Q 98,116 105,128" />
      <path d="M 55,110 Q 62,98  69,110" />
      <path d="M 91,110 Q 98,98  105,110" />

      {/* ── Conical roof ─────────────────────────────────────────────────── */}
      <polyline points="43,90 80,25 117,90" />
      {/* Rib lines */}
      <line x1="80" y1="25" x2="60" y2="90" strokeOpacity="0.4" />
      <line x1="80" y1="25" x2="100" y2="90" strokeOpacity="0.4" />
      <line x1="80" y1="25" x2="80" y2="90" strokeOpacity="0.3" />

      {/* ── Finial ───────────────────────────────────────────────────────── */}
      <line x1="80" y1="25" x2="80" y2="10" />
      <circle cx="80" cy="8" r="3" />
    </svg>
  );
}

// ─── Bosphorus Bridge ─────────────────────────────────────────────────────────
// Suspension bridge: two H-towers, main cable, hangers, road deck, water

export function BosphorusBridge({ className }: Props) {
  return (
    <svg
      viewBox="0 0 800 220"
      fill="none"
      stroke="#4ba6ea"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* ── Water surface ────────────────────────────────────────────────── */}
      <path d="M 0,182 Q 100,176 200,182 Q 300,188 400,182 Q 500,176 600,182 Q 700,188 800,182" strokeOpacity="0.4" />
      <path d="M 0,194 Q 100,188 200,194 Q 300,200 400,194 Q 500,188 600,194 Q 700,200 800,194" strokeOpacity="0.25" />
      <path d="M 0,206 Q 100,201 200,206 Q 300,211 400,206 Q 500,201 600,206 Q 700,211 800,206" strokeOpacity="0.12" />

      {/* ── Road deck ────────────────────────────────────────────────────── */}
      <line x1="0" y1="165" x2="800" y2="165" />

      {/* ── Left tower ───────────────────────────────────────────────────── */}
      {/* Left post */}
      <line x1="196" y1="50"  x2="196" y2="165" />
      {/* Right post */}
      <line x1="214" y1="50"  x2="214" y2="165" />
      {/* Cross beam */}
      <rect x="188" y="92"  width="34" height="12" rx="1" />
      {/* Top cap */}
      <rect x="188" y="50"  width="34" height="9"  rx="1" />

      {/* ── Right tower ──────────────────────────────────────────────────── */}
      <line x1="586" y1="50"  x2="586" y2="165" />
      <line x1="604" y1="50"  x2="604" y2="165" />
      <rect x="578" y="92"  width="34" height="12" rx="1" />
      <rect x="578" y="50"  width="34" height="9"  rx="1" />

      {/* ── Main suspension cable ────────────────────────────────────────── */}
      {/*
        Anchorage (30,172) → left tower top (205,54) →
        catenary Q(400,168) → right tower top (595,54) → anchorage (770,172)
      */}
      <path d="M 30,172 L 205,54 Q 400,170 595,54 L 770,172" />

      {/* ── Vertical hangers ─────────────────────────────────────────────── */}
      {/*
        Bezier from (205,54) Q (400,170) to (595,54):
        t=0.10 → x≈228, y≈72    t=0.20 → x≈268, y≈95
        t=0.30 → x≈316, y≈112   t=0.40 → x≈360, y≈124
        t=0.50 → x≈400, y≈130   (midspan)
      */}
      <line x1="240" y1="74"  x2="240" y2="165" />
      <line x1="275" y1="95"  x2="275" y2="165" />
      <line x1="315" y1="111" x2="315" y2="165" />
      <line x1="355" y1="123" x2="355" y2="165" />
      <line x1="400" y1="130" x2="400" y2="165" />
      <line x1="445" y1="123" x2="445" y2="165" />
      <line x1="485" y1="111" x2="485" y2="165" />
      <line x1="525" y1="95"  x2="525" y2="165" />
      <line x1="560" y1="74"  x2="560" y2="165" />

      {/* ── Shore approach lines ──────────────────────────────────────────── */}
      <path d="M 0,165 Q 15,162 30,165"  strokeOpacity="0.5" />
      <path d="M 770,165 Q 785,162 800,165" strokeOpacity="0.5" />
    </svg>
  );
}

// ─── Ottoman Tulip ────────────────────────────────────────────────────────────
// Classic Ottoman "lale" motif: elongated pointed petals, calyx, stem, leaves

export function OttomanTulip({ className }: Props) {
  return (
    <svg
      viewBox="0 0 100 200"
      fill="none"
      stroke="#4ba6ea"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* ── Stem ─────────────────────────────────────────────────────────── */}
      <line x1="50" y1="192" x2="50" y2="128" />

      {/* ── Leaves ───────────────────────────────────────────────────────── */}
      <path d="M 50,162 C 34,152 20,136 24,118 C 30,132 42,148 50,160" />
      <path d="M 50,162 C 66,152 80,136 76,118 C 70,132 58,148 50,160" />

      {/* ── Calyx (small cup where petals meet stem) ──────────────────────── */}
      <path d="M 40,128 C 40,120 44,116 50,116 C 56,116 60,120 60,128" />

      {/* ── Central petal (tall, narrow, flame-shaped) ────────────────────── */}
      {/*  Outline: go up the left edge, curve to tip, come back down right  */}
      <path d="M 50,116 C 43,90 41,60 50,14 C 59,60 57,90 50,116" />

      {/* ── Left petal (angled, shorter) ─────────────────────────────────── */}
      <path d="M 50,116 C 38,96 24,78 18,50 C 30,70 42,90 50,116" />

      {/* ── Right petal (symmetric) ───────────────────────────────────────── */}
      <path d="M 50,116 C 62,96 76,78 82,50 C 70,70 58,90 50,116" />

      {/* ── Petal vein lines (subtle inner lines) ────────────────────────── */}
      <line x1="50" y1="116" x2="50"  y2="40"  strokeOpacity="0.4" />
      <path d="M 50,116 C 42,96 32,78 28,56"   strokeOpacity="0.3" />
      <path d="M 50,116 C 58,96 68,78 72,56"   strokeOpacity="0.3" />
    </svg>
  );
}
