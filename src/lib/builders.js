/**
 * Pure helpers that turn user input into the exact string encoded in the QR.
 * Every builder returns { value, error } — `error` is a human-readable message
 * when the input is not usable yet.
 */

const URL_LIKE = /^(https?:\/\/|www\.)/i;
const DOMAIN_LIKE = /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i;

export const isUrlLike = (s = "") =>
  URL_LIKE.test(s.trim()) || DOMAIN_LIKE.test(s.trim());

export const ensureHttps = (s = "") => {
  const t = s.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/+/, "")}`;
};

export const cleanHandle = (s = "") =>
  s
    .trim()
    .replace(/^@+/, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "");

/** Accepts a full profile URL or just a username and returns a canonical URL. */
export const handleOrUrl = (input = "", base, { keepAt = false } = {}) => {
  const t = input.trim();
  if (!t) return { value: "", error: "Enter a username or paste the profile link." };
  if (isUrlLike(t)) return { value: ensureHttps(t) };
  const handle = cleanHandle(t);
  if (!handle) return { value: "", error: "Enter a valid username." };
  return { value: `${base}${keepAt ? "@" : ""}${handle}` };
};

export const digitsOnly = (s = "") => s.replace(/[^\d]/g, "");

export const normalizePhone = (raw = "", defaultCountry = "91") => {
  const t = raw.trim();
  if (!t) return "";
  let digits = digitsOnly(t);
  if (t.startsWith("+")) return digits;
  if (t.startsWith("00")) return digits.replace(/^00/, "");
  // 10-digit local number → prefix default country code
  if (digits.length === 10) digits = `${defaultCountry}${digits}`;
  return digits;
};

const escapeWifi = (s = "") => s.replace(/([\\;,:"])/g, "\\$1");
const escapeVCard = (s = "") => s.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");

export const builders = {
  link: ({ url }) => {
    const t = (url || "").trim();
    if (!t) return { value: "", error: "Paste the link you want people to open." };
    if (!isUrlLike(t) && !/^[a-z][a-z0-9+.-]*:/i.test(t))
      return { value: ensureHttps(t), error: "This doesn't look like a link. Double-check it." };
    return { value: /^[a-z][a-z0-9+.-]*:/i.test(t) && !URL_LIKE.test(t) ? t : ensureHttps(t) };
  },

  googleReview: ({ input }) => {
    const t = (input || "").trim();
    if (!t) return { value: "", error: "Paste your Google review link or Place ID." };
    if (/^ChIJ[\w-]+$/i.test(t) || /^0x[0-9a-f]+:0x[0-9a-f]+$/i.test(t))
      return { value: `https://search.google.com/local/writereview?placeid=${t}` };
    if (isUrlLike(t)) return { value: ensureHttps(t) };
    return { value: "", error: "Enter a Google review link (g.page/r/…) or a Place ID starting with ChIJ." };
  },

  googleMaps: ({ input }) => {
    const t = (input || "").trim();
    if (!t) return { value: "", error: "Paste your Google Maps share link or type your business name & area." };
    if (isUrlLike(t)) return { value: ensureHttps(t) };
    return { value: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t)}` };
  },

  whatsapp: ({ phone, message }) => {
    const digits = normalizePhone(phone || "");
    if (!digits) return { value: "", error: "Enter your WhatsApp number with country code." };
    if (digits.length < 8) return { value: "", error: "That number looks too short." };
    const msg = (message || "").trim();
    return { value: `https://wa.me/${digits}${msg ? `?text=${encodeURIComponent(msg)}` : ""}` };
  },

  phone: ({ phone }) => {
    const digits = normalizePhone(phone || "");
    if (!digits) return { value: "", error: "Enter the phone number to call." };
    return { value: `tel:+${digits}` };
  },

  sms: ({ phone, message }) => {
    const digits = normalizePhone(phone || "");
    if (!digits) return { value: "", error: "Enter the number that should receive the SMS." };
    const msg = (message || "").trim();
    return { value: `SMSTO:+${digits}:${msg}` };
  },

  email: ({ email, subject, body }) => {
    const e = (email || "").trim();
    if (!e) return { value: "", error: "Enter the email address." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { value: "", error: "That email address looks wrong." };
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    return { value: `mailto:${e}${params.length ? `?${params.join("&")}` : ""}` };
  },

  wifi: ({ ssid, password, encryption = "WPA", hidden }) => {
    const s = (ssid || "").trim();
    if (!s) return { value: "", error: "Enter your Wi-Fi network name (SSID)." };
    if (encryption !== "nopass" && !(password || "").trim())
      return { value: "", error: "Enter the Wi-Fi password, or choose “Open network”." };
    const parts = [`WIFI:T:${encryption};S:${escapeWifi(s)};`];
    if (encryption !== "nopass") parts.push(`P:${escapeWifi(password)};`);
    if (hidden) parts.push("H:true;");
    return { value: `${parts.join("")};` };
  },

  upi: ({ upiId, name, amount, note }) => {
    const id = (upiId || "").trim();
    if (!id) return { value: "", error: "Enter your UPI ID (e.g. shop@okaxis)." };
    if (!/^[\w.-]{2,}@[a-z]{2,}$/i.test(id)) return { value: "", error: "UPI ID should look like name@bank." };
    const p = new URLSearchParams();
    p.set("pa", id);
    if ((name || "").trim()) p.set("pn", name.trim());
    if (amount && Number(amount) > 0) p.set("am", Number(amount).toFixed(2));
    if ((note || "").trim()) p.set("tn", note.trim());
    p.set("cu", "INR");
    return { value: `upi://pay?${p.toString()}` };
  },

  vcard: ({ firstName, lastName, org, title, phone, email, website, address }) => {
    const fn = (firstName || "").trim();
    const ln = (lastName || "").trim();
    if (!fn && !ln && !(org || "").trim())
      return { value: "", error: "Enter at least a name or business name." };
    const lines = ["BEGIN:VCARD", "VERSION:3.0"];
    lines.push(`N:${escapeVCard(ln)};${escapeVCard(fn)};;;`);
    lines.push(`FN:${escapeVCard([fn, ln].filter(Boolean).join(" ") || org)}`);
    if (org) lines.push(`ORG:${escapeVCard(org)}`);
    if (title) lines.push(`TITLE:${escapeVCard(title)}`);
    if (phone) lines.push(`TEL;TYPE=CELL:+${normalizePhone(phone)}`);
    if (email) lines.push(`EMAIL:${email.trim()}`);
    if (website) lines.push(`URL:${ensureHttps(website)}`);
    if (address) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`);
    lines.push("END:VCARD");
    return { value: lines.join("\n") };
  },

  text: ({ text }) => {
    const t = (text || "").trim();
    if (!t) return { value: "", error: "Type the text you want to encode." };
    return { value: t };
  },
};

/** Rough capacity guard — a byte-mode QR at level H holds ~1,273 chars. */
export const QR_MAX_CHARS = 1200;
