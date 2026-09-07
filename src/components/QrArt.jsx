import { useMemo } from "react";
import { getMatrix, inFinder } from "../lib/qrmatrix";

/**
 * Designer QR code rendered as plain SVG primitives.
 *
 *  - `dots`: "rounded" (circular modules), "square" (classic) or "soft"
 *    (rounded squares). Finder "eyes" are always drawn as smooth rounded
 *    frames so the code still reads as a QR at a glance.
 *  - `eyeColor` tints the three finder patterns (brand colour by default).
 *  - `logoRatio` clears a centred square for a logo (needs level H).
 *
 * Renders a <g>; wrap it in an <svg> or place inside a larger drawing.
 */
export default function QrArt({
  value,
  x = 0,
  y = 0,
  size,
  level = "H",
  fg = "#111111",
  bg = "#FFFFFF",
  eyeColor,
  dots = "rounded",
  logoRatio = 0,
  drawBackground = true,
  gradientId,
}) {
  const matrix = useMemo(() => getMatrix(value, level), [value, level]);
  const n = matrix.size;
  const m = size / n;
  const eye = eyeColor || fg;
  const fill = gradientId ? `url(#${gradientId})` : fg;

  // Logo excavation (in module units, always odd so it stays centred)
  let clear = 0;
  if (logoRatio > 0) {
    clear = Math.ceil(n * logoRatio);
    if (clear % 2 !== n % 2) clear += 1;
  }
  const lo = (n - clear) / 2;
  const hi = lo + clear;

  const body = useMemo(() => {
    const parts = [];
    const r = m * 0.5;
    for (let row = 0; row < n; row++) {
      const cells = matrix.rows[row];
      for (let col = 0; col < n; col++) {
        if (!cells[col]) continue;
        if (inFinder(row, col, n)) continue;
        if (clear && row >= lo && row < hi && col >= lo && col < hi) continue;
        const cx = x + col * m + r;
        const cy = y + row * m + r;
        if (dots === "rounded") {
          parts.push(`M${(cx - r * 0.92).toFixed(2)},${cy.toFixed(2)}a${(r * 0.92).toFixed(2)},${(r * 0.92).toFixed(2)} 0 1,0 ${(r * 1.84).toFixed(2)},0a${(r * 0.92).toFixed(2)},${(r * 0.92).toFixed(2)} 0 1,0 -${(r * 1.84).toFixed(2)},0z`);
        } else if (dots === "soft") {
          const s = m * 0.9;
          const rr = s * 0.3;
          const x0 = cx - s / 2;
          const y0 = cy - s / 2;
          parts.push(`M${(x0 + rr).toFixed(2)},${y0.toFixed(2)}h${(s - 2 * rr).toFixed(2)}a${rr},${rr} 0 0 1 ${rr},${rr}v${(s - 2 * rr).toFixed(2)}a${rr},${rr} 0 0 1 -${rr},${rr}h-${(s - 2 * rr).toFixed(2)}a${rr},${rr} 0 0 1 -${rr},-${rr}v-${(s - 2 * rr).toFixed(2)}a${rr},${rr} 0 0 1 ${rr},-${rr}z`);
        } else {
          parts.push(`M${(x + col * m).toFixed(2)},${(y + row * m).toFixed(2)}h${m.toFixed(2)}v${m.toFixed(2)}h-${m.toFixed(2)}z`);
        }
      }
    }
    return parts.join("");
  }, [matrix, n, m, x, y, dots, clear, lo, hi]);

  const eyes = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ];
  const rounded = dots !== "square";

  return (
    <g>
      {drawBackground && <rect x={x} y={y} width={size} height={size} fill={bg} />}
      <path d={body} fill={fill} />
      {eyes.map(([r, c]) => {
        const ex = x + c * m;
        const ey = y + r * m;
        const outer = 7 * m;
        const inner = 3 * m;
        return (
          <g key={`${r}-${c}`}>
            <rect
              x={ex + m / 2}
              y={ey + m / 2}
              width={outer - m}
              height={outer - m}
              rx={rounded ? m * 1.6 : 0}
              fill="none"
              stroke={eye}
              strokeWidth={m}
            />
            <rect x={ex + 2 * m} y={ey + 2 * m} width={inner} height={inner} rx={rounded ? m * 0.9 : 0} fill={eye} />
          </g>
        );
      })}
    </g>
  );
}
