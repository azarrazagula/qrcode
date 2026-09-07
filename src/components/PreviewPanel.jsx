import { useState } from "react";
import QrArt from "./QrArt";
import { isDark, shade } from "../lib/color";
import {
  LuDownload,
  LuPrinter,
  LuShare2,
  LuChevronDown,
  LuSmartphone,
  LuFileImage,
  LuFileCode,
  LuLayoutGrid,
  LuFile,
  LuLoader,
} from "react-icons/lu";
import QrCard from "./QrCard";
import { Button } from "./ui";
import { formatById, mmToPx, PRINT_DPI } from "../data/design";
import { serializeSvg, rasterize, svgToBlob, downloadBlob, canShareFiles, shareBlob, slugify } from "../lib/export";
import { sheetLayout } from "../lib/print";

export const CARD_SVG_ID = "qr-card-main";
const PLAIN_SVG_ID = "qr-plain";

export default function PreviewPanel({ value, platform, text, design, ready, onPrint, onExported }) {
  const [mode, setMode] = useState("card"); // card | qr
  const [busy, setBusy] = useState("");
  const [menu, setMenu] = useState(null); // "card" | "qr" | "print" | null
  const [toast, setToast] = useState("");

  const fmt = formatById(design.format);
  const px = fmt.px || [mmToPx(fmt.w), mmToPx(fmt.h)];
  const layout = sheetLayout(fmt);
  const baseName = slugify(`${text.business || platform.name}-${platform.id}-qr`);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const run = async (key, fn) => {
    if (!ready || busy) return;
    setMenu(null);
    setBusy(key);
    try {
      await fn();
      onExported?.();
    } catch (e) {
      flash(e.message || "Something went wrong.");
    } finally {
      setBusy("");
    }
  };

  const cardSvg = () => document.getElementById(CARD_SVG_ID);
  const plainSvg = () => document.getElementById(PLAIN_SVG_ID);

  const exportCard = (type) =>
    run(`card-${type}`, async () => {
      const el = cardSvg();
      if (type === "svg") {
        downloadBlob(svgToBlob(serializeSvg(el, { width: px[0], height: px[1] })), `${baseName}-${fmt.id}.svg`);
        return;
      }
      const blob = await rasterize(serializeSvg(el, { width: px[0], height: px[1] }), px[0], px[1], {
        type: type === "jpg" ? "image/jpeg" : "image/png",
      });
      downloadBlob(blob, `${baseName}-${fmt.id}-${PRINT_DPI}dpi.${type}`);
      flash(`Saved ${type.toUpperCase()} · ${px[0]}×${px[1]} px`);
    });

  const exportPlain = (type) =>
    run(`qr-${type}`, async () => {
      const el = plainSvg();
      const size = 2048;
      if (type === "svg") {
        downloadBlob(svgToBlob(serializeSvg(el, { width: size, height: size })), `${baseName}.svg`);
        return;
      }
      const blob = await rasterize(serializeSvg(el, { width: size, height: size }), size, size, {
        type: type === "jpg" ? "image/jpeg" : "image/png",
      });
      downloadBlob(blob, `${baseName}.${type}`);
      flash(`Saved QR ${type.toUpperCase()} · ${size}×${size} px`);
    });

  const share = () =>
    run("share", async () => {
      const el = mode === "qr" ? plainSvg() : cardSvg();
      const [w, h] = mode === "qr" ? [1600, 1600] : px;
      const blob = await rasterize(serializeSvg(el, { width: w, height: h }), w, h);
      await shareBlob(blob, `${baseName}.png`, `${text.headline || platform.cta} — ${text.business || ""}`.trim());
    });

  const cardProps = {
    value,
    platform,
    headline: text.headline || platform.cta,
    subline: text.subline,
    business: text.business,
    design,
  };

  return (
    <div className="lg:sticky lg:top-20">
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900">Live preview</h2>
            <p className="truncate text-[11px] text-slate-500">
              {mode === "card" ? `${fmt.name} · ${fmt.dims} · ${px[0]}×${px[1]} px @ ${fmt.px ? "1×" : `${PRINT_DPI} DPI`}` : "Plain QR · transparent-free PNG / SVG"}
            </p>
          </div>
          <div className="flex shrink-0 rounded-lg bg-slate-100 p-0.5 text-xs font-semibold whitespace-nowrap">
            {[
              ["card", "Card"],
              ["qr", "QR only"],
            ].map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                className={`rounded-md px-3 py-1.5 transition ${mode === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="relative flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] p-5 sm:p-7">
          <div className={`transition-opacity ${ready ? "opacity-100" : "opacity-40"}`}>
            {mode === "card" ? (
              <div className="overflow-hidden rounded-xl shadow-2xl shadow-slate-900/20 ring-1 ring-black/5" style={{ width: "min(100%, 340px)", margin: "0 auto" }}>
                <QrCard {...cardProps} width="100%" svgId={CARD_SVG_ID} style={{ display: "block", maxHeight: "60vh", width: "100%", height: "auto" }} />
              </div>
            ) : (
              <div className="rounded-xl bg-white p-4 shadow-2xl shadow-slate-900/20 ring-1 ring-black/5">
                <PlainQr value={value} platform={platform} design={design} size={260} />
              </div>
            )}
          </div>
          {!ready && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-600 shadow ring-1 ring-slate-200">
                Fill in step 2 to activate your QR
              </span>
            </div>
          )}
          {toast && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-lg">
              {toast}
            </div>
          )}
        </div>

        {/* Hidden, full-resolution plain QR used for "QR only" exports */}
        <div className="hidden" aria-hidden>
          <PlainQr value={value} platform={platform} design={design} size={1000} svgId={PLAIN_SVG_ID} />
        </div>

        {/* Actions */}
        <div className="space-y-2 border-t border-slate-100 p-4">
          <div className="grid grid-cols-2 gap-2">
            <Dropdown
              open={menu === "card"}
              disabled={!ready || !!busy}
              onToggle={() => setMenu(menu === "card" ? null : "card")}
              trigger={
                <Button variant="primary" size="lg" className="w-full whitespace-nowrap" disabled={!ready || !!busy} icon={busy.startsWith("card") ? LuLoader : LuDownload}>
                  Download <LuChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                </Button>
              }
            >
              <MenuItem icon={LuFileImage} onClick={() => exportCard("png")} label="PNG — print ready" hint={`${px[0]}×${px[1]} px`} />
              <MenuItem icon={LuFileImage} onClick={() => exportCard("jpg")} label="JPG — for WhatsApp" hint="Smaller file" />
              <MenuItem icon={LuFileCode} onClick={() => exportCard("svg")} label="SVG — vector" hint="For designers / print shops" />
              <MenuItem icon={LuFile} onClick={() => { setMenu(null); onPrint("single"); }} label="PDF — via print dialog" hint={`${fmt.dims} page`} />
            </Dropdown>

            <Dropdown
              open={menu === "print"}
              disabled={!ready || !!busy}
              onToggle={() => setMenu(menu === "print" ? null : "print")}
              trigger={
                <Button variant="dark" size="lg" className="w-full whitespace-nowrap" disabled={!ready || !!busy} icon={LuPrinter}>
                  Print <LuChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                </Button>
              }
            >
              <MenuItem icon={LuFile} onClick={() => { setMenu(null); onPrint("single"); }} label="One per page" hint={`Page size ${fmt.dims}`} />
              <MenuItem
                icon={LuLayoutGrid}
                onClick={() => { setMenu(null); onPrint("sheet"); }}
                label={`Fill an A4 sheet — ${layout.count} ${layout.count === 1 ? "copy" : "copies"}`}
                hint={`${layout.cols} × ${layout.rows}, ${layout.orientation}, with cut lines`}
              />
            </Dropdown>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Dropdown
              open={menu === "qr"}
              disabled={!ready || !!busy}
              onToggle={() => setMenu(menu === "qr" ? null : "qr")}
              trigger={
                <Button variant="secondary" className="w-full" disabled={!ready || !!busy} icon={busy.startsWith("qr") ? LuLoader : LuDownload}>
                  QR only <LuChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                </Button>
              }
            >
              <MenuItem icon={LuFileImage} onClick={() => exportPlain("png")} label="PNG" hint="2048×2048 px" />
              <MenuItem icon={LuFileImage} onClick={() => exportPlain("jpg")} label="JPG" hint="2048×2048 px" />
              <MenuItem icon={LuFileCode} onClick={() => exportPlain("svg")} label="SVG" hint="Vector" />
            </Dropdown>
            {canShareFiles() ? (
              <Button variant="secondary" className="w-full" disabled={!ready || !!busy} icon={LuShare2} onClick={share}>
                Share
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 text-[11px] text-slate-500">
                <LuSmartphone className="h-3.5 w-3.5" aria-hidden /> Open on your phone to share via WhatsApp
              </div>
            )}
          </div>

          <p className="pt-1 text-center text-[11px] text-slate-400">
            Static QR · never expires · no sign-up · nothing leaves your browser. An AiTechies Studio tool.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Stand-alone QR (no card) using the same designer rendering. */
function PlainQr({ value, platform, design, size, svgId }) {
  const hasLogo = design.logo !== "none" && !(design.logo === "custom" && !design.customLogo);
  const brandDeep = isDark(platform.color) ? platform.color : shade(platform.color, -0.42);
  const fg = design.brandFg ? brandDeep : design.fgColor;
  const margin = size * 0.06;
  const inner = size - margin * 2;
  const Icon = platform.icon;
  const box = inner * 0.21;
  return (
    <svg id={svgId} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="QR code">
      <rect x={0} y={0} width={size} height={size} fill={design.bgColor} />
      <QrArt
        value={value || " "}
        x={margin}
        y={margin}
        size={inner}
        level={hasLogo ? "H" : "Q"}
        fg={fg}
        bg={design.bgColor}
        eyeColor={design.eyeBrand === false ? fg : brandDeep}
        dots={design.qrStyle || "rounded"}
        logoRatio={hasLogo ? 0.22 : 0}
        drawBackground={false}
      />
      {hasLogo && design.logo === "platform" && (
        <g>
          <rect x={size / 2 - box / 2} y={size / 2 - box / 2} width={box} height={box} rx={box * 0.24} fill={design.bgColor} />
          <Icon x={size / 2 - box * 0.3} y={size / 2 - box * 0.3} size={box * 0.6} color={platform.color} />
        </g>
      )}
      {hasLogo && design.logo === "custom" && (
        <g>
          <rect x={size / 2 - box / 2} y={size / 2 - box / 2} width={box} height={box} rx={box * 0.24} fill="#FFFFFF" />
          <image href={design.customLogo} x={size / 2 - box * 0.42} y={size / 2 - box * 0.42} width={box * 0.84} height={box * 0.84} preserveAspectRatio="xMidYMid meet" />
        </g>
      )}
    </svg>
  );
}

function Dropdown({ open, onToggle, trigger, children, disabled }) {
  return (
    <div className="relative">
      <div onClick={() => !disabled && onToggle()}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} aria-hidden />
          <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl animate-pop">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
      </span>
    </button>
  );
}
