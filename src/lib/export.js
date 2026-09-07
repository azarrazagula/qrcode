/**
 * Export helpers. All of them work on an <svg> element already in the DOM,
 * so what you see in the preview is exactly what gets downloaded.
 */

export const serializeSvg = (svgEl, { width, height } = {}) => {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  clone.removeAttribute("id");
  if (width) clone.setAttribute("width", width);
  if (height) clone.setAttribute("height", height);
  // Mirror href → xlink:href so older rasterisers resolve text paths and images
  clone.querySelectorAll("textPath[href], image[href]").forEach((el) => {
    el.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", el.getAttribute("href"));
  });
  const xml = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
};

export const svgToBlob = (svgString) => new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not render the SVG image."));
    img.src = url;
  });

/**
 * Rasterises an SVG string to a PNG/JPEG blob at the given pixel size.
 * A data URL is used instead of a blob URL because Safari refuses to draw
 * blob-URL SVGs that contain nested <image> elements.
 */
export const rasterize = async (svgString, width, height, { type = "image/png", quality = 0.95, background } = {}) => {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  const img = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext("2d");
  if (background || type === "image/jpeg") {
    ctx.fillStyle = background || "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed."))), type, quality),
  );
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const canShareFiles = () =>
  typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare;

export const shareBlob = async (blob, filename, text) => {
  const file = new File([blob], filename, { type: blob.type });
  if (!navigator.canShare?.({ files: [file] })) throw new Error("Sharing files is not supported here.");
  await navigator.share({ files: [file], title: filename, text });
};

export const slugify = (s = "") =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "qr";

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
};
