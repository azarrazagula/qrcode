import { useState } from "react";
import { LuInfo, LuCopy, LuCheck, LuExternalLink, LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import { Card, StepHeading, Label, Input, Textarea, Select, Toggle } from "./ui";
import { copyText } from "../lib/export";
import { QR_MAX_CHARS } from "../lib/builders";

const isOpenable = (v) => /^(https?:|mailto:|tel:|upi:)/i.test(v);

export default function DetailsForm({ platform, values, onChange, text, onTextChange, result }) {
  const [copied, setCopied] = useState(false);
  const { value, error } = result;
  const tooLong = value.length > QR_MAX_CHARS;

  const copy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <StepHeading
        step={2}
        title={`Enter your ${platform.name} details`}
        subtitle="Only what's needed — we build the exact link the QR will open."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {platform.fields.map((f) => {
          const id = `f-${platform.id}-${f.key}`;
          const span = f.half ? "" : "sm:col-span-2";
          const common = {
            id,
            value: values[f.key] ?? "",
            onChange: (e) => onChange(f.key, e.target.value),
            placeholder: f.placeholder,
            autoComplete: "off",
          };
          if (f.type === "checkbox") {
            return (
              <div key={f.key} className={span}>
                <Toggle checked={!!values[f.key]} onChange={(v) => onChange(f.key, v)} label={f.label} />
              </div>
            );
          }
          return (
            <div key={f.key} className={span}>
              <Label htmlFor={id}>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea {...common} />
              ) : f.type === "select" ? (
                <Select {...common}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  {...common}
                  type={f.type === "password" ? "text" : f.type}
                  inputMode={f.type === "tel" ? "tel" : f.type === "number" ? "decimal" : undefined}
                  autoFocus={platform.fields[0] === f}
                />
              )}
              {f.help && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500">
                  <LuInfo className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{f.help}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Encoded value preview */}
      <div
        className={`mt-5 rounded-xl border p-3 text-xs ${
          error || tooLong ? "border-amber-200 bg-amber-50" : value ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            {error || tooLong ? (
              <LuCircleAlert className="h-4 w-4 text-amber-600" aria-hidden />
            ) : value ? (
              <LuCircleCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            ) : null}
            {error ? error : tooLong ? "This is too long to scan reliably — shorten it." : value ? "Your QR will open:" : "Fill in the details above"}
          </span>
          {value && !error && (
            <span className="flex items-center gap-1">
              {isOpenable(value) && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-slate-600 hover:bg-white"
                  title="Test the link"
                >
                  <LuExternalLink className="h-3.5 w-3.5" aria-hidden /> Test
                </a>
              )}
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-slate-600 hover:bg-white"
              >
                {copied ? <LuCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <LuCopy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </button>
            </span>
          )}
        </div>
        {value && !error && (
          <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">{value}</p>
        )}
      </div>

      {/* Card text */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="mb-3 text-sm font-bold text-slate-800">Text on the printed card</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="t-headline" hint="(big text)">Call to action</Label>
            <Input
              id="t-headline"
              value={text.headline}
              onChange={(e) => onTextChange("headline", e.target.value)}
              placeholder={platform.cta}
              maxLength={60}
            />
          </div>
          <div>
            <Label htmlFor="t-business">Business name</Label>
            <Input
              id="t-business"
              value={text.business}
              onChange={(e) => onTextChange("business", e.target.value)}
              placeholder="Your Shop Name"
              maxLength={40}
            />
          </div>
          <div>
            <Label htmlFor="t-subline" hint="(small text)">Sub text</Label>
            <Input
              id="t-subline"
              value={text.subline}
              onChange={(e) => onTextChange("subline", e.target.value)}
              placeholder={platform.sub || "Optional"}
              maxLength={80}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
