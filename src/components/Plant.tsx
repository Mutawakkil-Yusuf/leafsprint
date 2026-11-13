/**
 * The plant — the one bold element of Leafsprint.
 * Generative SVG: one stylized pot, and growth drawn from stage data so
 * every stage stays in the same visual voice. Sway is the only idle motion.
 */

type LeafSpec = { x: number; y: number; rot: number; rx: number; ry: number };

function leafPositions(
  topY: number,
  height: number,
  count: number,
  baseScale: number
): LeafSpec[] {
  const out: LeafSpec[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const y = topY + 6 + t * (height - 22);
    const side = i % 2 === 0 ? -1 : 1;
    const scale = baseScale * (0.8 + 0.35 * t);
    out.push({
      x: 100 + side * (10 + 10 * scale),
      y,
      rot: side * 42 - side * 6 * t,
      rx: 13 * scale,
      ry: 6.5 * scale,
    });
  }
  return out;
}

const POT_TOP = 214;

export function Plant({
  stage,
  watered,
  className,
}: {
  stage: number;
  watered: boolean;
  className?: string;
}) {
  const s = Math.max(0, Math.min(7, stage));
  const heights = [0, 30, 48, 64, 82, 96, 108, 116];
  const leafCounts = [0, 2, 3, 4, 6, 0, 0, 0]; // trees use canopies instead
  const stemTop = POT_TOP - heights[s];
  const leaves =
    s >= 1 && s <= 4 ? leafPositions(stemTop, heights[s], leafCounts[s], 0.9 + 0.14 * s) : [];
  const isTree = s === 5 || s === 6;
  const isEvergreen = s === 7;

  return (
    <svg viewBox="0 0 200 266" className={className} role="img" aria-label={`Your reading plant, growth stage ${s + 1} of 8`}>
      {/* pot */}
      <path d="M64 216h72l-8 42a6 6 0 0 1-6 5H78a6 6 0 0 1-6-5z" fill="var(--clay)" />
      <path d="M64 216h36l-4 47h-18a6 6 0 0 1-6-5z" fill="color-mix(in srgb, var(--clay) 82%, black)" />
      <rect x="58" y="208" width="84" height="12" rx="6" fill="var(--clay)" />
      <ellipse cx="100" cy="211" rx="34" ry="4" fill="#3a2e22" />

      <g className="plant-sway">
        {s === 0 && (
          <g>
            <ellipse cx="100" cy="204" rx="7" ry="5" fill="#8a6b4a" transform="rotate(-18 100 204)" />
            <path d="M96 200c1-4 6-5 8-2" stroke="var(--leaf-soft)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {!isTree && !isEvergreen && s > 0 && (
          <>
            <path
              d={`M100 ${POT_TOP - 2} C 92 ${POT_TOP - heights[s] * 0.45}, 108 ${stemTop + 12}, 100 ${stemTop}`}
              stroke="var(--leaf)"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            {leaves.map((l, i) => (
              <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
                <ellipse rx={l.rx} ry={l.ry} fill={i % 2 ? "var(--leaf-soft)" : "var(--leaf)"} />
                <path d={`M${-l.rx + 2} 0 H ${l.rx - 2}`} stroke="var(--paper)" strokeWidth="1" opacity="0.55" />
              </g>
            ))}
            {(s === 3 || s === 4) && (
              <circle cx="100" cy={stemTop - 6} r={s === 4 ? 7 : 5} fill="var(--honey)" opacity="0.9" />
            )}
          </>
        )}

        {isTree && (
          <>
            <path d="M100 212 C 98 190, 102 170, 100 148" stroke="#6b4f37" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M100 186 C 88 178, 80 172, 72 164" stroke="#6b4f37" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="122" r={s === 6 ? 34 : 26} fill="var(--leaf)" />
            <circle cx={s === 6 ? 66 : 74} cy="138" r={s === 6 ? 24 : 18} fill="var(--leaf-soft)" />
            <circle cx={s === 6 ? 134 : 126} cy="140" r={s === 6 ? 22 : 16} fill="var(--leaf)" opacity="0.88" />
            {s === 6 && (
              <>
                <circle cx="128" cy="108" r="16" fill="var(--honey)" opacity="0.85" />
                <circle cx="76" cy="104" r="12" fill="var(--honey)" opacity="0.7" />
              </>
            )}
          </>
        )}

        {isEvergreen && (
          <>
            <path d="M100 212 L 100 140" stroke="#6b4f37" strokeWidth="7" strokeLinecap="round" />
            <path d="M100 42 L 132 96 L 68 96 Z" fill="var(--leaf)" />
            <path d="M100 78 L 142 146 L 58 146 Z" fill="var(--leaf-soft)" />
            <path d="M100 118 L 150 196 L 50 196 Z" fill="var(--leaf)" />
            <path d="M100 42 L 132 96 L 68 96 Z" fill="none" stroke="var(--paper)" strokeWidth="1" opacity="0.25" />
          </>
        )}

        {watered && (
          <g>
            <path d="M116 206c0-3 4-7 4-7s4 4 4 7a4 4 0 1 1-8 0z" fill="var(--honey)" />
            <circle cx="84" cy="196" r="2.5" fill="var(--honey)" opacity="0.8" />
          </g>
        )}
      </g>
    </svg>
  );
}
