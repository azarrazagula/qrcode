import { useRef } from "react";
import { LuUpload, LuX, LuTriangleAlert } from "react-icons/lu";
import { TEMPLATES, FORMATS, QR_STYLES } from "../data/design";
import { Card, StepHeading, Label, ColorInput, Toggle, Chip } from "./ui";
import QrCard from "./QrCard";
import { contrastRatio, isDark, shade } from "../lib/color";

const SWATCHES = ["#111111", "#1E293B", "#1D4ED8", "#047857", "#B91C1C", "#7C3AED", "#BE185D", "#B45309"];

export default function DesignPanel({ design, onChange, platform, text, value }) {
  const fileRef = useRef(null);
  const set = (k, v) => onChange({ ...design, [k]: v });

  const effectiveFg = design.brandFg ? (isDark(platform.color) ? platform.color : shade(platform.color, -0.45)) : design.fgColor;
  const contrast = contrastRatio(effectiveFg, design.bgColor);
  const lowContrast = contrast < 4;

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...design, logo: "custom", customLogo: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const previewProps = {
    value: value || "https://example.com",
    platform,
    headline: text.headline || platform.cta,
    subline: text.subline,
    business: text.business,
  };

  return (
    <Card className="p-5 sm:p-6">
      <StepHeading step={3} title="Design the print card" subtitle="Templates are print-ready — colours come from the platform." />

      {/* Templates */}
      <Label>Template</Label>
      <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {TEMPLATES.map((t) => {
          const active = design.template === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...design, template: t.id, format: t.id === "sticker" && design.format !== "square" ? "square" : design.format })}
              className={`group rounded-xl border p-1.5 text-left transition ${
                active ? "border-ink ring-2 ring-neon/60" : "border-slate-200 hover:border-slate-300"
              }`}
              title={t.desc}
              aria-pressed={active}
            >
              <div className="overflow-hidden rounded-lg bg-slate-100">
                <QrCard {...previewProps} design={{ ...design, template: t.id, format: "a6" }} width="100%" svgId={`tpl-${t.id}`} />
              </div>
              <span className="mt-1.5 block text-center text-[11px] font-semibold text-slate-700">{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Format */}
      <Label>Print size</Label>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {FORMATS.map((f) => (
          <Chip key={f.id} active={design.format === f.id} onClick={() => set("format", f.id)} title={f.dims}>
            {f.name} <span className="opacity-70">· {f.dims}</span>
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Colours */}
        <div className="space-y-3">
          <Label>QR colours</Label>
          <div className="flex flex-wrap gap-1.5">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ ...design, fgColor: c, brandFg: false })}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  !design.brandFg && design.fgColor === c ? "border-neon scale-110 ring-1 ring-ink" : "border-white shadow"
                }`}
                style={{ background: c }}
                aria-label={`QR colour ${c}`}
              />
            ))}
            <button
              type="button"
              onClick={() => set("brandFg", !design.brandFg)}
              className={`h-7 rounded-full border-2 px-2 text-[11px] font-semibold transition ${
                design.brandFg ? "border-neon scale-105 ring-1 ring-ink" : "border-white shadow"
              }`}
              style={{ background: platform.color, color: platform.onColor || "#fff" }}
            >
              Brand
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ColorInput id="c-fg" label="Dots" value={effectiveFg} onChange={(v) => onChange({ ...design, fgColor: v, brandFg: false })} />
            <ColorInput id="c-bg" label="Background" value={design.bgColor} onChange={(v) => set("bgColor", v)} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="mr-1 text-xs font-semibold text-slate-600">Dot style</span>
            {QR_STYLES.map((st) => (
              <Chip key={st.id} active={(design.qrStyle || "rounded") === st.id} onClick={() => set("qrStyle", st.id)}>
                {st.name}
              </Chip>
            ))}
          </div>
          <Toggle checked={design.eyeBrand !== false} onChange={(v) => set("eyeBrand", v)} label="Brand-coloured corner eyes" />
          {lowContrast && (
            <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
              <LuTriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Low contrast — some phones may struggle to scan. Use dark dots on a light background.
            </p>
          )}
        </div>

        {/* Logo & extras */}
        <div className="space-y-3">
          <Label>Logo in the centre</Label>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={design.logo === "platform"} onClick={() => set("logo", "platform")}>{platform.name} icon</Chip>
            <Chip active={design.logo === "custom"} onClick={() => (design.customLogo ? set("logo", "custom") : fileRef.current?.click())}>
              Your logo
            </Chip>
            <Chip active={design.logo === "none"} onClick={() => set("logo", "none")}>None</Chip>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={onFile} />
          {design.logo === "custom" && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-2">
              {design.customLogo ? (
                <img src={design.customLogo} alt="Your logo" className="h-10 w-10 rounded-lg object-contain bg-white" />
              ) : (
                <span className="h-10 w-10 rounded-lg bg-slate-100" />
              )}
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline">
                <LuUpload className="h-3.5 w-3.5" aria-hidden /> {design.customLogo ? "Replace" : "Upload PNG / JPG / SVG"}
              </button>
              {design.customLogo && (
                <button type="button" onClick={() => onChange({ ...design, customLogo: "", logo: "platform" })} className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Remove logo">
                  <LuX className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-slate-500">Square logos with a plain background scan best.</p>
          <div className="space-y-2 pt-1">
            <Toggle checked={design.showFooter} onChange={(v) => set("showFooter", v)} label="Show “open your camera” hint" />
            <Toggle checked={design.showBranding} onChange={(v) => set("showBranding", v)} label="Show AiTechies signature" />
          </div>
        </div>
      </div>
    </Card>
  );
}
