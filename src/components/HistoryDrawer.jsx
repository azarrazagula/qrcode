import { LuX, LuTrash2, LuClock } from "react-icons/lu";
import { platformById } from "../data/platforms";
import QrCard from "./QrCard";
import { Button } from "./ui";

const timeAgo = (ts) => {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  return `${Math.floor(d / 86400)} d ago`;
};

export default function HistoryDrawer({ open, onClose, items, onRestore, onRemove, onClear }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 print:hidden" role="dialog" aria-modal="true" aria-label="Recent QR codes">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent QR codes</h2>
            <p className="text-xs text-slate-500">Saved on this device when you download or print.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <LuX className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
              <LuClock className="h-8 w-8" aria-hidden />
              <p className="text-sm">Nothing yet. Your downloads will show up here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const platform = platformById(item.platformId);
                return (
                  <li key={item.id} className="flex gap-3 rounded-xl border border-slate-200 p-2.5 hover:border-slate-300">
                    <button type="button" onClick={() => onRestore(item)} className="w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100" aria-label="Restore">
                      <QrCard
                        value={item.value}
                        platform={platform}
                        headline={item.text.headline || platform.cta}
                        subline={item.text.subline}
                        business={item.text.business}
                        design={item.design}
                        width="100%"
                        svgId={`hist-${item.id}`}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{item.text.business || item.text.headline || platform.cta}</p>
                      <p className="truncate text-xs text-slate-500">{platform.name} · {timeAgo(item.ts)}</p>
                      <p className="mt-1 truncate font-mono text-[10px] text-slate-400">{item.value}</p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => onRestore(item)}>Open</Button>
                        <Button size="sm" variant="danger" icon={LuTrash2} onClick={() => onRemove(item.id)} aria-label="Delete" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-slate-100 p-4">
            <Button variant="ghost" size="sm" icon={LuTrash2} onClick={onClear} className="w-full text-slate-500">
              Clear all
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
