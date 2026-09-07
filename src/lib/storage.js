const KEY = "aitechies-qr-history-v1";
const MAX = 12;

export const loadHistory = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveHistoryEntry = (entry) => {
  try {
    const list = loadHistory().filter((e) => e.value !== entry.value);
    const next = [{ ...entry, ts: Date.now() }, ...list].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadHistory();
  }
};

export const removeHistoryEntry = (id) => {
  try {
    const next = loadHistory().filter((e) => e.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadHistory();
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return [];
};
