import { useMemo, useState } from "react";
import { LuSearch, LuCheck } from "react-icons/lu";
import { PLATFORMS, GROUPS } from "../data/platforms";
import { Card, StepHeading, Chip } from "./ui";

export default function PlatformPicker({ selectedId, onSelect }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Popular");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return PLATFORMS.filter((p) => `${p.name} ${p.group} ${p.cta}`.toLowerCase().includes(q));
    if (group === "All") return PLATFORMS;
    return PLATFORMS.filter((p) => p.group === group);
  }, [query, group]);

  return (
    <Card className="p-5 sm:p-6">
      <StepHeading
        step={1}
        title="What should customers open when they scan?"
        subtitle="Pick a platform — we'll write the call-to-action for you."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: Instagram, review, Wi-Fi, UPI…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            aria-label="Search platforms"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["All", ...GROUPS].map((g) => (
            <Chip key={g} active={!query && group === g} onClick={() => { setQuery(""); setGroup(g); }}>
              {g}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5" role="radiogroup" aria-label="Platform">
        {visible.map((p) => {
          const Icon = p.icon;
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(p.id)}
              className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition ${
                active
                  ? "border-ink bg-slate-50 shadow-sm ring-2 ring-neon/60"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-inner"
                style={{ background: p.color, color: p.onColor || "#fff" }}
              >
                <Icon size={22} />
              </span>
              <span className="text-xs font-semibold text-slate-700 leading-tight">{p.name}</span>
              {active && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-neon text-ink">
                  <LuCheck size={10} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
        {visible.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-slate-500">
            Nothing matched — try “link” to use any URL.
          </p>
        )}
      </div>
    </Card>
  );
}
