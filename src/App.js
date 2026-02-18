import { useState, useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import logo from "./assets/AiTechie.png";

const App = () => {
  const [url, setUrl] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [qrSize, setQrSize] = useState(256);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [fgColor, setFgColor] = useState("#000000");
  const qrRef = useRef(null);

  const handleGenerate = useCallback(() => {
    if (url.trim()) {
      setQrValue(url.trim());
    }
  }, [url]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleGenerate();
    },
    [handleGenerate]
  );

  const handleDownload = useCallback(
    (format) => {
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) return;

      if (format === "png") {
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else if (format === "jpg") {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        const ctx = tmpCanvas.getContext("2d");
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        const link = document.createElement("a");
        link.download = "qrcode.jpg";
        link.href = tmpCanvas.toDataURL("image/jpeg", 0.95);
        link.click();
      } else if (format === "svg") {
        // Re-render as SVG for download
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", qrSize);
        svg.setAttribute("height", qrSize);
        // Fallback: export canvas as embedded image in SVG
        const image = document.createElementNS(svgNS, "image");
        image.setAttribute("href", canvas.toDataURL("image/png"));
        image.setAttribute("width", qrSize);
        image.setAttribute("height", qrSize);
        svg.appendChild(image);
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svg);
        const blob = new Blob([svgStr], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.download = "qrcode.svg";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    },
    [bgColor, qrSize]
  );

  const handleClear = useCallback(() => {
    setUrl("");
    setQrValue("");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col items-center justify-start py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <a
          href="https://ansaribrahim.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-col items-center mb-3 group"
        >
          <img
            src={logo}
            alt="AiTechies"
            className="w-32 h-20 rounded-lg shadow-md group-hover:scale-105 transition-transform"
          />
          <span className="mt-2 text-sm font-bold tracking-wide text-indigo-600 group-hover:text-cyan-500 transition">
            AiTechies
          </span>
        </a>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
          QR Code Generator
        </h1>
        <p className="mt-2 text-gray-500 text-sm sm:text-base max-w-md mx-auto">
          Paste any link — Google Maps, website, or anything else — and generate a free, permanent QR code instantly.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
        {/* URL Input */}
        <div>
          <label
            htmlFor="url-input"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Enter or paste a link
          </label>
          <div className="flex gap-2">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://maps.google.com/..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder:text-gray-400"
            />
            <button
              onClick={handleGenerate}
              disabled={!url.trim()}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-sm sm:text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Customization Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Size
            </label>
            <select
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value={128}>Small (128px)</option>
              <option value={256}>Medium (256px)</option>
              <option value={512}>Large (512px)</option>
              <option value={1024}>XL (1024px)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Foreground
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-9 h-9 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500 uppercase">
                {fgColor}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-9 h-9 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500 uppercase">
                {bgColor}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        {qrValue && (
          <div className="flex flex-col items-center space-y-5 pt-2">
            <div
              ref={qrRef}
              className="p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 inline-block"
            >
              <QRCodeCanvas
                value={qrValue}
                size={qrSize}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Encoded URL preview */}
            <p className="text-xs text-gray-400 break-all text-center max-w-full px-2">
              {qrValue}
            </p>

            {/* Download Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleDownload("png")}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                ⬇ Download PNG
              </button>
              <button
                onClick={() => handleDownload("jpg")}
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition"
              >
                ⬇ Download JPG
              </button>
              <button
                onClick={() => handleDownload("svg")}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
              >
                ⬇ Download SVG
              </button>
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="text-sm text-gray-400 hover:text-red-500 transition"
            >
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center space-y-1">
        <p className="text-xs text-gray-400">
          QR codes generated here are static &amp; permanent — they never expire.
        </p>
        <p className="text-xs text-gray-400">
          Built by{" "}
          <a
            href="https://ansaribrahim.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-700 font-medium transition"
          >
            AiTechies
          </a>
        </p>
      </div>
    </div>
  );
};

export default App;
