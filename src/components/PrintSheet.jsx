import { createPortal } from "react-dom";
import QrCard from "./QrCard";
import { formatById } from "../data/design";
import { sheetLayout } from "../lib/print";

/**
 * Rendered into #print-root (outside the app) and only displayed by the
 * @media print rules in index.css. `job` is "single" or "sheet".
 */
export default function PrintSheet({ job, cardProps }) {
  const root = document.getElementById("print-root");
  if (!root || !job) return null;
  const fmt = formatById(cardProps.design.format);

  if (job === "single") {
    return createPortal(
      <>
        <style>{`@page { size: ${fmt.w}mm ${fmt.h}mm; margin: 0; }`}</style>
        <div className="print-page" style={{ width: `${fmt.w}mm`, height: `${fmt.h}mm` }}>
          <QrCard {...cardProps} width={`${fmt.w}mm`} height={`${fmt.h}mm`} svgId="print-single" />
        </div>
      </>,
      root,
    );
  }

  const lay = sheetLayout(fmt);
  const cellW = lay.fits ? fmt.w : lay.PW;
  const cellH = lay.fits ? fmt.h : lay.PH;
  const cards = Array.from({ length: lay.count });
  return createPortal(
    <>
      <style>{`@page { size: A4 ${lay.orientation}; margin: 0; }`}</style>
      <div
        className="print-page"
        style={{
          width: `${lay.PW}mm`,
          height: `${lay.PH}mm`,
          display: "grid",
          gridTemplateColumns: `repeat(${lay.cols}, ${cellW}mm)`,
          gridTemplateRows: `repeat(${lay.rows}, ${cellH}mm)`,
          justifyContent: "space-evenly",
          alignContent: "space-evenly",
        }}
      >
        {cards.map((_, i) => (
          <div key={i} className="print-cell" style={{ width: `${cellW}mm`, height: `${cellH}mm` }}>
            <QrCard {...cardProps} width={`${cellW}mm`} height={`${cellH}mm`} svgId={`print-${i}`} />
          </div>
        ))}
      </div>
    </>,
    root,
  );
}
