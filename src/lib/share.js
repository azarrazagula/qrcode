/**
 * Encodes the editor state into the URL hash so a design can be bookmarked or
 * sent to someone else (e.g. the print shop). Custom logos are never included.
 */
const KEY = "s";

export const encodeState = (state) => {
  try {
    const json = JSON.stringify(state);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
};

export const decodeState = (str = "") => {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const obj = JSON.parse(json);
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
};

export const readStateFromUrl = () => {
  const m = window.location.hash.match(new RegExp(`${KEY}=([A-Za-z0-9_-]+)`));
  return m ? decodeState(m[1]) : null;
};

export const writeStateToUrl = (state) => {
  const encoded = encodeState(state);
  if (!encoded) return;
  const next = `#${KEY}=${encoded}`;
  if (window.location.hash !== next) window.history.replaceState(null, "", next);
};

export const clearStateFromUrl = () => window.history.replaceState(null, "", window.location.pathname);
