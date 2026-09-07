const A4 = { w: 210, h: 297 };

/** Works out how many copies of a card fit on an A4 sheet (portrait or landscape). */
export const sheetLayout = (fmt) => {
  const fit = (PW, PH, orientation) => {
    const cols = Math.max(1, Math.floor(PW / fmt.w));
    const rows = Math.max(1, Math.floor(PH / fmt.h));
    // fall back to a single scaled copy when the card is bigger than the page
    const fits = fmt.w <= PW && fmt.h <= PH;
    return { cols: fits ? cols : 1, rows: fits ? rows : 1, count: fits ? cols * rows : 1, orientation, PW, PH, fits };
  };
  const p = fit(A4.w, A4.h, "portrait");
  const l = fit(A4.h, A4.w, "landscape");
  return l.count > p.count ? l : p;
};
