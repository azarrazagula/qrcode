import qrcode from "qrcode-generator";

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

const cache = new Map();

/**
 * Returns { size, isDark(r, c) } for a value. Results are memoised because
 * the card re-renders on every keystroke.
 */
export const getMatrix = (value, level = "H") => {
  const key = `${level}:${value}`;
  if (cache.has(key)) return cache.get(key);
  let qr;
  try {
    qr = qrcode(0, level);
    qr.addData(value || " ");
    qr.make();
  } catch {
    qr = qrcode(0, "L");
    qr.addData("…");
    qr.make();
  }
  const n = qr.getModuleCount();
  const rows = [];
  for (let r = 0; r < n; r++) {
    const row = new Uint8Array(n);
    for (let c = 0; c < n; c++) row[c] = qr.isDark(r, c) ? 1 : 0;
    rows.push(row);
  }
  const m = { size: n, rows };
  if (cache.size > 60) cache.delete(cache.keys().next().value);
  cache.set(key, m);
  return m;
};

/** True when (r,c) belongs to one of the three finder patterns. */
export const inFinder = (r, c, n) =>
  (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
