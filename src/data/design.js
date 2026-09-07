export const TEMPLATES = [
  { id: "classic", name: "Classic", desc: "White card, brand-colour header" },
  { id: "bold", name: "Bold", desc: "Full brand colour, white QR panel" },
  { id: "minimal", name: "Minimal", desc: "Clean white, thin border" },
  { id: "dark", name: "Night", desc: "Dark card with brand accent" },
  { id: "sticker", name: "Sticker", desc: "Round badge for doors & counters" },
];

/** Physical sizes in millimetres. `perA4` is how many fit on one A4 sheet. */
export const FORMATS = [
  { id: "a6", name: "A6 card", dims: "105 × 148 mm", w: 105, h: 148, perA4: 4 },
  { id: "a5", name: "A5 card", dims: "148 × 210 mm", w: 148, h: 210, perA4: 2 },
  { id: "a4", name: "A4 poster", dims: "210 × 297 mm", w: 210, h: 297, perA4: 1 },
  { id: "square", name: "Square sticker", dims: "100 × 100 mm", w: 100, h: 100, perA4: 4 },
  { id: "landscape", name: "Counter stand", dims: "148 × 105 mm", w: 148, h: 105, perA4: 4 },
  { id: "story", name: "Phone story", dims: "1080 × 1920 px", w: 90, h: 160, perA4: 1, px: [1080, 1920] },
];

export const formatById = (id) => FORMATS.find((f) => f.id === id) || FORMATS[0];

export const DEFAULT_DESIGN = {
  template: "classic",
  format: "a6",
  fgColor: "#111111",
  bgColor: "#FFFFFF",
  brandFg: false, // colour the QR modules with the brand colour
  eyeBrand: true, // tint the three finder "eyes" with the brand colour
  qrStyle: "rounded", // rounded | soft | square
  logo: "platform", // platform | custom | none
  customLogo: "", // data URL
  showFooter: true,
  showBranding: true,
};

export const QR_STYLES = [
  { id: "rounded", name: "Dots" },
  { id: "soft", name: "Soft" },
  { id: "square", name: "Classic" },
];

export const PRINT_DPI = 300;

export const mmToPx = (mm, dpi = PRINT_DPI) => Math.round((mm / 25.4) * dpi);
