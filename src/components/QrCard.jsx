import { useMemo } from "react";
import QrArt from "./QrArt";
import { formatById } from "../data/design";
import { fitText, wrapLines, measure } from "../lib/text";
import { isDark, shade, textOn } from "../lib/color";
import mark from "../assets/aitechiesMark";

export const CARD_W = 1000;
export const CARD_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const NEON = "#00FF88";
const INK = "#050505";

/* ───────────────────────── reusable pieces ───────────────────────── */

/** AiTechies signature pill: [brain mark] AI TECHIES */
function Signature({ cx, x, y, tone = "light", scale = 1, id = "sig" }) {
  const h = 56 * scale;
  const fs = 24 * scale;
  const ls = 1.5 * scale;
  const iconD = 42 * scale;
  const gap = 12 * scale;
  const padX = 16 * scale;
  const tw = measure("AITECHIES", fs, 0.7) + ls * 9;
  const w = padX + iconD + gap + tw + padX;
  const left = x ?? cx - w / 2;
  const fill = tone === "light" ? INK : "rgba(255,255,255,0.12)";
  const stroke = tone === "light" ? "none" : "rgba(255,255,255,0.28)";
  return (
    <g>
      <rect x={left} y={y - h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <clipPath id={`${id}-clip`}>
        <rect x={left + padX} y={y - iconD / 2} width={iconD} height={iconD} rx={iconD * 0.28} />
      </clipPath>
      <image href={mark} x={left + padX} y={y - iconD / 2} width={iconD} height={iconD} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-clip)`} />
      <text x={left + padX + iconD + gap} y={y + fs * 0.36} fontFamily={CARD_FONT} fontWeight="800" fontSize={fs} letterSpacing={ls}>
        <tspan fill={NEON}>AI</tspan>
        <tspan fill="#FFFFFF">TECHIES</tspan>
      </text>
    </g>
  );
}

/** "SCAN ME" pill */
function ScanPill({ cx, cy, color, textColor = "#FFFFFF", label = "SCAN ME" }) {
  const fs = 21;
  const w = measure(label, fs, 0.68) + 4 * label.length + 56;
  const h = 46;
  return (
    <g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={color} />
      <text x={cx} y={cy + fs * 0.36} textAnchor="middle" fontFamily={CARD_FONT} fontWeight="800" fontSize={fs} letterSpacing={4} fill={textColor}>
        {label}
      </text>
    </g>
  );
}

/** Corner brackets that frame the QR like a camera viewfinder. */
function Brackets({ x, y, size, color, len = 64, stroke = 9 }) {
  const o = stroke / 2;
  const x1 = x - o;
  const y1 = y - o;
  const x2 = x + size + o;
  const y2 = y + size + o;
  const d = [
    `M${x1},${y1 + len} V${y1 + 22} Q${x1},${y1} ${x1 + 22},${y1} H${x1 + len}`,
    `M${x2 - len},${y1} H${x2 - 22} Q${x2},${y1} ${x2},${y1 + 22} V${y1 + len}`,
    `M${x1},${y2 - len} V${y2 - 22} Q${x1},${y2} ${x1 + 22},${y2} H${x1 + len}`,
    `M${x2 - len},${y2} H${x2 - 22} Q${x2},${y2} ${x2},${y2 - 22} V${y2 - len}`,
  ].join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />;
}

/** Big translucent circles for depth on coloured surfaces. */
function Decor({ w, h, color = "#FFFFFF", clipId }) {
  return (
    <g clipPath={clipId ? `url(#${clipId})` : undefined} fill={color}>
      <circle cx={w * 0.92} cy={-h * 0.05} r={w * 0.28} fillOpacity={0.09} />
      <circle cx={w * 0.08} cy={h * 0.98} r={w * 0.34} fillOpacity={0.07} />
      <circle cx={w * 0.14} cy={h * 0.12} r={w * 0.08} fillOpacity={0.1} />
    </g>
  );
}

/* ───────────────────────────── the card ───────────────────────────── */

export default function QrCard({
  value,
  platform,
  headline,
  subline,
  business,
  design,
  width,
  height,
  svgId = "qr-card",
  className,
  style,
}) {
  const fmt = formatById(design.format);
  const W = CARD_W;
  const H = Math.round((W * fmt.h) / fmt.w);
  const brand = platform.color;
  const onBrand = platform.onColor || textOn(brand);
  const brandDeep = isDark(brand) ? brand : shade(brand, -0.42);
  const Icon = platform.icon;
  const template = design.template;

  const hasLogo = design.logo !== "none" && !(design.logo === "custom" && !design.customLogo);
  const level = hasLogo ? "H" : "Q";
  const qrFg = design.brandFg ? brandDeep : design.fgColor;
  const eyeColor = design.eyeBrand === false ? qrFg : brandDeep;
  const dots = design.qrStyle || "rounded";

  const theme = useMemo(() => {
    switch (template) {
      case "bold":
        return { bg: "gradient", text: onBrand, muted: onBrand, mutedOp: 0.8, panel: "#FFFFFF", badge: "white", tone: "dark" };
      case "dark":
        return { bg: "#0B1220", text: "#FFFFFF", muted: "#94A3B8", mutedOp: 1, panel: "#FFFFFF", badge: "brand", tone: "dark" };
      case "minimal":
        return { bg: "#FFFFFF", text: "#0F172A", muted: "#64748B", mutedOp: 1, panel: null, badge: "tint", tone: "light", border: true };
      case "sticker":
        return { bg: brand, text: onBrand, muted: onBrand, mutedOp: 0.85, panel: "#FFFFFF", badge: "white", tone: "dark" };
      default:
        return { bg: "#FFFFFF", text: "#0F172A", muted: "#64748B", mutedOp: 1, panel: null, badge: "white", tone: "light", band: true };
    }
  }, [template, brand, onBrand]);

  const qrBg = theme.panel ? "#FFFFFF" : design.bgColor;
  const gradId = `${svgId}-bg`;
  const clipId = `${svgId}-clip`;

  /* — QR with panel, logo, brackets and pill — */
  const renderQrBlock = (qx, qy, q, { panelPad, showPill = true, pillLabel }) => {
    const px = qx - panelPad;
    const py = qy - panelPad;
    const ps = q + panelPad * 2;
    const logoSide = q * 0.22;
    const box = logoSide * 0.96;
    const iconSize = box * 0.6;
    return (
      <g>
        {theme.panel ? (
          <g>
            <rect x={px} y={py + 14} width={ps} height={ps} rx={40} fill="#000000" fillOpacity={0.18} />
            <rect x={px} y={py} width={ps} height={ps} rx={40} fill={theme.panel} />
          </g>
        ) : (
          <rect x={px} y={py} width={ps} height={ps} rx={36} fill={qrBg} stroke={brand} strokeOpacity={0.18} strokeWidth={3} />
        )}
        <QrArt
          value={value || " "}
          x={qx}
          y={qy}
          size={q}
          level={level}
          fg={qrFg}
          bg={qrBg}
          eyeColor={eyeColor}
          dots={dots}
          logoRatio={hasLogo ? 0.22 : 0}
          drawBackground={false}
        />
        {hasLogo && design.logo === "platform" && (
          <g>
            <rect x={qx + q / 2 - box / 2} y={qy + q / 2 - box / 2} width={box} height={box} rx={box * 0.24} fill={qrBg} />
            <Icon x={qx + q / 2 - iconSize / 2} y={qy + q / 2 - iconSize / 2} size={iconSize} color={brand} />
          </g>
        )}
        {hasLogo && design.logo === "custom" && (
          <g>
            <rect x={qx + q / 2 - box / 2} y={qy + q / 2 - box / 2} width={box} height={box} rx={box * 0.24} fill="#FFFFFF" />
            <image href={design.customLogo} x={qx + q / 2 - box * 0.42} y={qy + q / 2 - box * 0.42} width={box * 0.84} height={box * 0.84} preserveAspectRatio="xMidYMid meet" />
          </g>
        )}
        {!theme.panel && <Brackets x={px} y={py} size={ps} color={brand} />}
        {showPill && <ScanPill cx={qx + q / 2} cy={py + ps} color={theme.panel ? brandDeep : brand} textColor={theme.panel ? "#FFFFFF" : onBrand} label={pillLabel} />}
      </g>
    );
  };

  /* — platform icon badge — */
  const renderBadge = (cx, cy, d, mode = theme.badge) => {
    const inner = d * 0.5;
    const ring = (fill, op) => <circle cx={cx} cy={cy} r={d / 2 + 14} fill={fill} fillOpacity={op} />;
    if (mode === "white")
      return (
        <g>
          {ring("#FFFFFF", 0.18)}
          <circle cx={cx} cy={cy} r={d / 2} fill="#FFFFFF" />
          <Icon x={cx - inner / 2} y={cy - inner / 2} size={inner} color={brand} />
        </g>
      );
    if (mode === "brand")
      return (
        <g>
          {ring(brand, 0.25)}
          <circle cx={cx} cy={cy} r={d / 2} fill={brand} />
          <Icon x={cx - inner / 2} y={cy - inner / 2} size={inner} color={onBrand} />
        </g>
      );
    return (
      <g>
        <circle cx={cx} cy={cy} r={d / 2} fill={brand} fillOpacity={0.12} />
        <Icon x={cx - inner / 2} y={cy - inner / 2} size={inner} color={brand} />
      </g>
    );
  };

  const hintText = "Open your phone camera & point it here";

  const defs = (
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={shade(brand, 0.08)} />
        <stop offset="100%" stopColor={shade(brand, -0.38)} />
      </linearGradient>
      <clipPath id={clipId}>
        <rect x={0} y={0} width={W} height={H} />
      </clipPath>
    </defs>
  );

  const background = (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={theme.bg === "gradient" ? `url(#${gradId})` : theme.bg} />
      {theme.bg === "gradient" && <Decor w={W} h={H} clipId={clipId} />}
      {template === "dark" && (
        <g>
          <rect x={0} y={0} width={W} height={10} fill={brand} />
          <Decor w={W} h={H} color={brand} clipId={clipId} />
        </g>
      )}
      {theme.border && <rect x={22} y={22} width={W - 44} height={H - 44} rx={28} fill="none" stroke="#E2E8F0" strokeWidth={3} />}
    </g>
  );

  let body;

  /* ═══════════════════ STICKER ═══════════════════ */
  if (template === "sticker") {
    const s = Math.min(W, H);
    const cx = W / 2;
    const cy = H / 2 - (H > s + 120 ? 40 : 0);
    const R = s / 2 - 10;
    const ring = 150;
    const inner = R - ring;
    const q = Math.round(inner * 1.16);
    const topR = R - 92;
    const botR = R - 50;
    const head = fitText(headline || platform.cta, Math.PI * topR * 0.78, 60, { maxLines: 1, minSize: 28, factor: 0.62 });
    const foot = fitText(business || hintText, Math.PI * botR * 0.78, 42, { maxLines: 1, minSize: 22, factor: 0.62 });
    body = (
      <g>
        <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" />
        <circle cx={cx} cy={cy} r={R} fill={brand} />
        <circle cx={cx} cy={cy} r={R - 22} fill="none" stroke={onBrand} strokeOpacity={0.4} strokeWidth={3} strokeDasharray="4 12" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={inner + 10} fill="#000000" fillOpacity={0.15} />
        <circle cx={cx} cy={cy} r={inner} fill="#FFFFFF" />
        <defs>
          <path id={`${svgId}-top`} d={`M ${cx - topR} ${cy} A ${topR} ${topR} 0 0 1 ${cx + topR} ${cy}`} />
          <path id={`${svgId}-bot`} d={`M ${cx - botR} ${cy} A ${botR} ${botR} 0 0 0 ${cx + botR} ${cy}`} />
        </defs>
        <text fontFamily={CARD_FONT} fontWeight="800" fontSize={head.size} fill={onBrand} letterSpacing={3}>
          <textPath href={`#${svgId}-top`} startOffset="50%" textAnchor="middle">{head.lines[0]}</textPath>
        </text>
        <text fontFamily={CARD_FONT} fontWeight="700" fontSize={foot.size} fill={onBrand} letterSpacing={2}>
          <textPath href={`#${svgId}-bot`} startOffset="50%" textAnchor="middle">{foot.lines[0]}</textPath>
        </text>
        <QrArt value={value || " "} x={cx - q / 2} y={cy - q / 2} size={q} level={level} fg={qrFg} bg="#FFFFFF" eyeColor={eyeColor} dots={dots} logoRatio={hasLogo ? 0.22 : 0} drawBackground={false} />
        {hasLogo && design.logo === "platform" && (
          <g>
            <rect x={cx - q * 0.105} y={cy - q * 0.105} width={q * 0.21} height={q * 0.21} rx={q * 0.05} fill="#FFFFFF" />
            <Icon x={cx - q * 0.065} y={cy - q * 0.065} size={q * 0.13} color={brand} />
          </g>
        )}
        {hasLogo && design.logo === "custom" && (
          <image href={design.customLogo} x={cx - q * 0.095} y={cy - q * 0.095} width={q * 0.19} height={q * 0.19} preserveAspectRatio="xMidYMid meet" />
        )}
        {design.showBranding && H > s + 120 && <Signature cx={cx} y={cy + R + 70} tone="light" scale={0.85} id={`${svgId}-sig`} />}
      </g>
    );
  } else if (H < W * 0.95) {
    /* ═══════════════════ LANDSCAPE ═══════════════════ */
    const pad = 60;
    const leftW = Math.round(W * 0.46);
    const panelPad = 26;
    const q = Math.min(H - pad * 2 - panelPad * 2 - 40, leftW - pad * 2 - panelPad * 2);
    const qx = pad + panelPad + (leftW - pad * 2 - panelPad * 2 - q) / 2;
    const qy = (H - q) / 2 - 10;
    const tx = leftW + 30;
    const tw = W - tx - pad;
    const iconD = 92;
    const head = fitText(headline || platform.cta, tw, 60, { maxLines: 2, minSize: 32 });
    const name = fitText(business, tw, 44, { maxLines: 1, minSize: 24 });
    const sub = wrapLines(subline, tw, 28, 2);
    const headH = head.lines.length * head.size * 1.12;
    const nameH = business ? name.size * 1.2 + 12 : 0;
    const subH = sub.length ? sub.length * 36 + 6 : 0;
    const sigH = design.showBranding ? 52 + 28 : 0;
    const hintH = design.showFooter ? 40 : 0;
    const total = iconD + 30 + headH + 20 + nameH + subH + 26 + hintH + sigH;
    const top = Math.max(pad, (H - total) / 2);
    const leftBand = template === "classic";
    const iconCy = top + iconD / 2;
    const headY = top + iconD + 30 + head.size * 0.86;
    const afterHead = top + iconD + 30 + headH + 20;
    const nameY = afterHead + name.size * 0.85;
    const subY = afterHead + nameH + 28 * 0.9;
    const hintY = afterHead + nameH + subH + 26 + 26;
    const sigY = hintY + (design.showFooter ? 30 : 0) + 26;
    const textColor = theme.text;
    const badgeMode = leftBand ? "brand" : theme.badge;
    const panelLeft = theme.panel || leftBand;

    body = (
      <g>
        {background}
        {leftBand && (
          <g>
            <rect x={0} y={0} width={leftW} height={H} fill={`url(#${gradId})`} />
            <g clipPath={`url(#${clipId})`}>
              <Decor w={leftW} h={H} />
            </g>
          </g>
        )}
        {panelLeft ? (
          <g>
            <rect x={qx - panelPad} y={qy - panelPad + 12} width={q + panelPad * 2} height={q + panelPad * 2} rx={34} fill="#000000" fillOpacity={0.18} />
            <rect x={qx - panelPad} y={qy - panelPad} width={q + panelPad * 2} height={q + panelPad * 2} rx={34} fill="#FFFFFF" />
          </g>
        ) : (
          <rect x={qx - panelPad} y={qy - panelPad} width={q + panelPad * 2} height={q + panelPad * 2} rx={34} fill={qrBg} stroke={brand} strokeOpacity={0.18} strokeWidth={3} />
        )}
        <QrArt value={value || " "} x={qx} y={qy} size={q} level={level} fg={qrFg} bg={qrBg} eyeColor={eyeColor} dots={dots} logoRatio={hasLogo ? 0.22 : 0} drawBackground={false} />
        {hasLogo && design.logo === "platform" && (
          <g>
            <rect x={qx + q * 0.395} y={qy + q * 0.395} width={q * 0.21} height={q * 0.21} rx={q * 0.05} fill={qrBg} />
            <Icon x={qx + q * 0.435} y={qy + q * 0.435} size={q * 0.13} color={brand} />
          </g>
        )}
        {hasLogo && design.logo === "custom" && (
          <g>
            <rect x={qx + q * 0.395} y={qy + q * 0.395} width={q * 0.21} height={q * 0.21} rx={q * 0.05} fill="#FFFFFF" />
            <image href={design.customLogo} x={qx + q * 0.41} y={qy + q * 0.41} width={q * 0.18} height={q * 0.18} preserveAspectRatio="xMidYMid meet" />
          </g>
        )}
        {!panelLeft && <Brackets x={qx - panelPad} y={qy - panelPad} size={q + panelPad * 2} color={brand} len={54} stroke={8} />}
        <ScanPill cx={qx + q / 2} cy={qy + q + panelPad} color={panelLeft ? brandDeep : brand} textColor={panelLeft ? "#FFFFFF" : onBrand} />
        {renderBadge(tx + iconD / 2, iconCy, iconD, badgeMode)}
        <text x={tx} y={headY} fontFamily={CARD_FONT} fontWeight="800" fontSize={head.size} fill={textColor} letterSpacing={-1}>
          {head.lines.map((l, i) => (
            <tspan key={i} x={tx} dy={i === 0 ? 0 : head.size * 1.12}>{l}</tspan>
          ))}
        </text>
        {business && (
          <text x={tx} y={nameY} fontFamily={CARD_FONT} fontWeight="700" fontSize={name.size} fill={textColor}>{name.lines[0]}</text>
        )}
        {sub.length > 0 && (
          <text x={tx} y={subY} fontFamily={CARD_FONT} fontSize={28} fill={theme.muted} fillOpacity={theme.mutedOp}>
            {sub.map((l, i) => (
              <tspan key={i} x={tx} dy={i === 0 ? 0 : 36}>{l}</tspan>
            ))}
          </text>
        )}
        {design.showFooter && (
          <text x={tx} y={hintY} fontFamily={CARD_FONT} fontSize={22} fill={theme.muted} fillOpacity={theme.mutedOp * 0.85}>{hintText}</text>
        )}
        {design.showBranding && <Signature x={tx} y={sigY} tone={theme.tone} scale={0.85} id={`${svgId}-sig`} />}
      </g>
    );
  } else {
    /* ═══════════════════ PORTRAIT / SQUARE / STORY ═══════════════════ */
    const tall = H / W;
    const pad = 64;
    const tw = W - pad * 2;
    const iconD = tall > 1.6 ? 128 : tall > 1.2 ? 108 : 92;
    const head = fitText(headline || platform.cta, tw - 40, tall > 1.2 ? 68 : 56, { maxLines: 2, minSize: 34 });
    const name = fitText(business, tw, 50, { maxLines: 1, minSize: 28 });
    const sub = wrapLines(subline, tw, 30, 2);
    const headLineH = head.size * 1.12;
    const headerH = 58 + iconD + 30 + head.lines.length * headLineH + (theme.band ? 84 : 24);
    const sigH = design.showBranding ? 52 + 30 : 0;
    const hintH = design.showFooter ? 40 : 0;
    const footerH = 40 + hintH + sigH + 28;
    const nameH = business ? name.size * 1.2 + 22 : 0;
    const subH = sub.length ? sub.length * 40 + 8 : 0;
    const panelPad = 34;
    const gapTop = 46;
    const gapBelow = 58 + (nameH || subH ? 24 : 0);
    const available = H - headerH - footerH - gapTop - gapBelow - nameH - subH;
    const q = Math.round(Math.min(tw - panelPad * 2 - 40, available - panelPad * 2, tall > 1.6 ? W * 0.66 : W * 0.72));
    const blockH = q + panelPad * 2 + gapBelow + nameH + subH;
    const extra = Math.max(0, H - headerH - footerH - gapTop - blockH);
    const headerText = theme.band ? onBrand : theme.text;

    const iconCy = 58 + iconD / 2;
    const headY = 58 + iconD + 30 + head.size * 0.88;
    const bandBottom = headerH;
    const qx = (W - q) / 2;
    const qy = headerH + gapTop + extra * 0.42 + panelPad;
    let cursor = qy + q + panelPad + gapBelow;
    const nameY = cursor + name.size * 0.82;
    if (business) cursor += nameH;
    const subY = cursor + 30 * 0.85;
    const sigY = H - 40 - 26;
    const hintY = H - 40 - sigH - 12;

    body = (
      <g>
        {background}
        {theme.band && (
          <g>
            <path d={`M0,0 H${W} V${bandBottom - 44} Q${W / 2},${bandBottom + 36} 0,${bandBottom - 44} Z`} fill={`url(#${gradId})`} />
            <g clipPath={`url(#${clipId})`}>
              <Decor w={W} h={bandBottom} />
            </g>
          </g>
        )}
        {template === "dark" && (
          <g>
            <circle cx={W / 2} cy={qy + q / 2} r={q * 0.95} fill={brand} fillOpacity={0.06} />
            <circle cx={W / 2} cy={qy + q / 2} r={q * 0.78} fill={brand} fillOpacity={0.08} />
          </g>
        )}
        {renderBadge(W / 2, iconCy, iconD)}
        <text x={W / 2} y={headY} textAnchor="middle" fontFamily={CARD_FONT} fontWeight="800" fontSize={head.size} fill={headerText} letterSpacing={-1}>
          {head.lines.map((l, i) => (
            <tspan key={i} x={W / 2} dy={i === 0 ? 0 : headLineH}>{l}</tspan>
          ))}
        </text>
        {renderQrBlock(qx, qy, q, { panelPad })}
        {business && (
          <text x={W / 2} y={nameY} textAnchor="middle" fontFamily={CARD_FONT} fontWeight="800" fontSize={name.size} fill={theme.text} letterSpacing={-0.5}>
            {name.lines[0]}
          </text>
        )}
        {sub.length > 0 && (
          <text x={W / 2} y={subY} textAnchor="middle" fontFamily={CARD_FONT} fontSize={30} fill={theme.muted} fillOpacity={theme.mutedOp}>
            {sub.map((l, i) => (
              <tspan key={i} x={W / 2} dy={i === 0 ? 0 : 40}>{l}</tspan>
            ))}
          </text>
        )}
        {design.showFooter && (
          <text x={W / 2} y={hintY} textAnchor="middle" fontFamily={CARD_FONT} fontSize={24} fill={theme.muted} fillOpacity={theme.mutedOp * 0.85}>{hintText}</text>
        )}
        {design.showBranding && <Signature cx={W / 2} y={sigY} tone={theme.tone} id={`${svgId}-sig`} />}
      </g>
    );
  }

  const num = (v) => (typeof v === "number" ? v : undefined);
  const outW = width ?? (num(height) ? (num(height) * W) / H : undefined);
  const outH = height ?? (num(width) ? (num(width) * H) / W : undefined);

  return (
    <svg
      id={svgId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`}
      width={outW}
      height={outH}
      className={className}
      style={style}
      role="img"
      aria-label={`${headline || platform.cta} QR code card`}
    >
      {defs}
      {body}
    </svg>
  );
}
