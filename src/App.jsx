import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import PlatformPicker from "./components/PlatformPicker";
import DetailsForm from "./components/DetailsForm";
import DesignPanel from "./components/DesignPanel";
import PreviewPanel from "./components/PreviewPanel";
import PrintSheet from "./components/PrintSheet";
import HistoryDrawer from "./components/HistoryDrawer";
import Guide, { Footer } from "./components/Guide";
import Hero from "./components/Hero";
import { LuArrowDown } from "react-icons/lu";
import { platformById, defaultValues, PLATFORMS } from "./data/platforms";
import { DEFAULT_DESIGN } from "./data/design";
import { loadHistory, saveHistoryEntry, removeHistoryEntry, clearHistory } from "./lib/storage";
import { readStateFromUrl, writeStateToUrl } from "./lib/share";

const EMPTY_TEXT = { headline: "", subline: "", business: "" };

/** Restores a design from the URL hash (shared / bookmarked link), if any. */
const initialState = () => {
  const s = readStateFromUrl();
  const platform = platformById(s?.platformId || PLATFORMS[0].id);
  const known = PLATFORMS.some((p) => p.id === s?.platformId);
  return {
    platformId: known ? s.platformId : PLATFORMS[0].id,
    valuesByPlatform: known && s.values ? { [platform.id]: { ...defaultValues(platform), ...s.values } } : {},
    text: { ...EMPTY_TEXT, headline: platform.cta, subline: platform.sub, ...(known ? s.text : {}) },
    design: { ...DEFAULT_DESIGN, ...(known ? s.design : {}), customLogo: "", logo: s?.design?.logo === "custom" ? "platform" : s?.design?.logo || DEFAULT_DESIGN.logo },
  };
};

export default function App() {
  const [init] = useState(initialState);
  const [platformId, setPlatformId] = useState(init.platformId);
  const platform = platformById(platformId);
  const [valuesByPlatform, setValuesByPlatform] = useState(init.valuesByPlatform);
  const [text, setText] = useState(init.text);
  const [design, setDesign] = useState(init.design);
  const [history, setHistory] = useState(() => loadHistory());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [printJob, setPrintJob] = useState(null);

  const values = valuesByPlatform[platformId] ?? defaultValues(platform);
  const result = useMemo(() => platform.build(values), [platform, values]);
  const ready = !!result.value && !result.error;

  const selectPlatform = useCallback(
    (id) => {
      const next = platformById(id);
      setPlatformId(id);
      // Refresh the call-to-action unless the user wrote their own
      setText((t) => ({
        ...t,
        headline: !t.headline || t.headline === platform.cta ? next.cta : t.headline,
        subline: !t.subline || t.subline === platform.sub ? next.sub : t.subline,
      }));
    },
    [platform],
  );

  const setValue = (key, v) =>
    setValuesByPlatform((all) => ({ ...all, [platformId]: { ...(all[platformId] ?? defaultValues(platform)), [key]: v } }));

  const setTextField = (key, v) => setText((t) => ({ ...t, [key]: v }));

  const cardProps = {
    value: result.value,
    platform,
    headline: text.headline || platform.cta,
    subline: text.subline,
    business: text.business,
    design,
  };

  const remember = useCallback(() => {
    if (!ready) return;
    const entry = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      platformId,
      values,
      text,
      value: result.value,
      design: { ...design, customLogo: design.customLogo.length < 150_000 ? design.customLogo : "" },
    };
    setHistory(saveHistoryEntry(entry));
  }, [ready, platformId, values, text, result.value, design]);

  const restore = (item) => {
    setPlatformId(item.platformId);
    setValuesByPlatform((all) => ({ ...all, [item.platformId]: item.values }));
    setText(item.text);
    setDesign({ ...DEFAULT_DESIGN, ...item.design, logo: item.design.logo === "custom" && !item.design.customLogo ? "platform" : item.design.logo });
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Print: mount the sheet, wait a frame for the browser to lay it out, then print.
  useEffect(() => {
    if (!printJob) return undefined;
    const done = () => setPrintJob(null);
    window.addEventListener("afterprint", done);
    const t = setTimeout(() => window.print(), 120);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", done);
    };
  }, [printJob]);

  // Keep a shareable copy of the design in the URL (debounced, no logo data).
  useEffect(() => {
    if (!ready) return undefined;
    const t = setTimeout(() => {
      const { customLogo, ...safeDesign } = design;
      writeStateToUrl({ platformId, values, text, design: safeDesign });
    }, 400);
    return () => clearTimeout(t);
  }, [ready, platformId, values, text, design]);

  const print = (job) => {
    if (!ready) return;
    remember();
    setPrintJob({ mode: job, ts: Date.now() });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header onOpenHistory={() => setHistoryOpen(true)} historyCount={history.length} />

      <Hero />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="space-y-6">
            <PlatformPicker selectedId={platformId} onSelect={selectPlatform} />
            <DetailsForm
              platform={platform}
              values={values}
              onChange={setValue}
              text={text}
              onTextChange={setTextField}
              result={result}
            />
            <DesignPanel design={design} onChange={setDesign} platform={platform} text={text} value={result.value} />
          </div>
          <div id="preview">
            <PreviewPanel
              value={result.value}
              platform={platform}
              text={text}
              design={design}
              ready={ready}
              onPrint={print}
              onExported={remember}
            />
          </div>
        </div>

        <Guide />
      </main>

      <Footer />

      {/* Mobile: jump to the preview once the QR is ready */}
      {ready && (
        <a
          href="#preview"
          className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-neon px-4 py-2.5 text-sm font-bold text-ink shadow-neon lg:hidden print:hidden"
        >
          <LuArrowDown className="h-4 w-4" aria-hidden /> See your card
        </a>
      )}

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={history}
        onRestore={restore}
        onRemove={(id) => setHistory(removeHistoryEntry(id))}
        onClear={() => setHistory(clearHistory())}
      />

      <PrintSheet job={printJob?.mode} cardProps={cardProps} />
    </div>
  );
}
