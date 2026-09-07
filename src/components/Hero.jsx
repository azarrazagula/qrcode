import { LuShieldCheck, LuInfinity, LuPrinter } from "react-icons/lu";

const POINTS = [
  { icon: LuInfinity, text: "Static codes — never expire" },
  { icon: LuShieldCheck, text: "Nothing leaves your browser" },
  { icon: LuPrinter, text: "300 DPI, print-shop ready" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white print:hidden">
      {/* subtle grid + glow, same mood as the company site */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-neon/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-64 w-96 rounded-full bg-cyan/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-14">
        <span className="font-mono text-[11px] tracking-[0.2em] text-cyan sm:text-xs">
          <span className="mr-2 border-l-2 border-cyan pl-2">{"// FREE TOOL BY AITECHIES"}</span>
        </span>
        <h1 className="mx-auto mt-4 max-w-4xl font-heading text-3xl font-bold leading-[1.15] tracking-tight [text-wrap:balance] sm:text-4xl md:text-5xl">
          Turn any link into a{" "}
          <span className="bg-gradient-to-r from-neon to-cyan bg-clip-text text-transparent">print-ready QR card</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-sub text-sm text-white/60 sm:text-base">
          Google reviews, Maps, Instagram, WhatsApp, UPI payments, Wi-Fi and more. Pick a platform, paste your link,
          download a card designed for your counter, door or table.
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70 sm:text-sm">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="inline-flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-neon" aria-hidden /> {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
