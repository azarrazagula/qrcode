/** Approximate width of a string in px for a bold sans-serif at `fontSize`. */
export const measure = (text = "", fontSize, factor = 0.58) => text.length * fontSize * factor;

/**
 * Greedy word wrap using an average-glyph-width estimate (no DOM needed, so it
 * works identically in preview and exported files).
 */
export const wrapLines = (text = "", maxWidth, fontSize, maxLines = 2, factor = 0.58) => {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate, fontSize, factor) <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (measure(`${last}…`, fontSize, factor) > maxWidth && last.length > 1) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.replace(/\s+$/, "")}…`;
    return kept;
  }
  return lines;
};

/** Shrinks the font until the text fits in `maxLines` at ≥ minSize. */
export const fitText = (text, maxWidth, startSize, { maxLines = 2, minSize = 24, factor = 0.58 } = {}) => {
  let size = startSize;
  let lines = wrapLines(text, maxWidth, size, 99, factor);
  while (lines.length > maxLines && size > minSize) {
    size -= 2;
    lines = wrapLines(text, maxWidth, size, 99, factor);
  }
  if (lines.length > maxLines) lines = wrapLines(text, maxWidth, size, maxLines, factor);
  return { size, lines };
};
