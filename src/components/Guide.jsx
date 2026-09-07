import { LuPrinter, LuMapPin, LuScissors, LuLightbulb, LuCircleHelp } from "react-icons/lu";
import { SiX } from "react-icons/si";
import { FaLinkedin, FaGithub } from "react-icons/fa6";
import { Logo } from "./Brand";
import { COMPANY } from "../data/company";

const TIPS = [
  {
    icon: LuPrinter,
    title: "Print at the right size",
    body: "Download the PNG (300 DPI) or choose Print → Fill an A4 sheet. A6 is perfect for counters and tables; A4 for doors and walls.",
  },
  {
    icon: LuMapPin,
    title: "Place it at eye level",
    body: "Near the billing counter, on the entrance door, on tables and inside delivery bags. People scan when they are already waiting.",
  },
  {
    icon: LuScissors,
    title: "Laminate or use a stand",
    body: "A ₹10 lamination keeps the code scannable for years. Keep at least a finger-width of white space around the code.",
  },
  {
    icon: LuLightbulb,
    title: "Test before printing 100 copies",
    body: "Scan the preview with two different phones. If a code is hard to scan, make it larger or use darker dots.",
  },
];

const FAQ = [
  ["Does the QR code expire?", "No. It's a static code — the link is baked into the pattern. It works forever, with no account and no fees."],
  ["Where do I get my Google review link?", "Open your Google Business Profile (business.google.com) → “Ask for reviews” → copy the short link. Paste it in step 2."],
  ["Can customers pay me through the UPI QR?", "Yes. Enter your UPI ID and name; GPay, PhonePe, Paytm and every UPI app will open with your details prefilled."],
  ["Is my data uploaded anywhere?", "No. Everything — the QR, the card, your logo — is generated inside your browser. Nothing leaves your device."],
  ["Can I change the link later?", "A static QR can't be edited after printing. Point it to a page you control (your Instagram, website or Google profile) so the content can change."],
];

export default function Guide() {
  return (
    <section className="mt-12 space-y-10 print:hidden" id="guide">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Tips for shop owners</h2>
        <p className="text-sm text-slate-500">Small things that make a big difference in how many people actually scan.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-neon">
                <Icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <LuCircleHelp className="h-5 w-5 text-slate-400" aria-hidden /> Questions people ask
        </h2>
        <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white shadow-card">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-800">
                {q}
                <span className="ml-3 text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="pb-2 pt-2 text-sm leading-relaxed text-slate-500">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const socialIcon = { x: SiX, linkedin: FaLinkedin, github: FaGithub };
  return (
    <footer className="mt-16 bg-ink text-white print:hidden">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="h-12" />
            <p className="mt-3 font-sub text-xs font-medium uppercase tracking-[0.25em] text-white/50">{COMPANY.tagline}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {COMPANY.legalName} is a tech studio from {COMPANY.location}. QR Studio is one of our free tools for local
              businesses.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {COMPANY.socials.map((s) => {
                const Icon = socialIcon[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-neon"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-sub text-sm font-bold">This tool</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li><a href="#guide" className="transition hover:text-neon">Tips for shop owners</a></li>
              <li><a href="#preview" className="transition hover:text-neon">Download &amp; print</a></li>
              <li><a href={COMPANY.site} target="_blank" rel="noopener noreferrer" className="transition hover:text-neon">About {COMPANY.name}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sub text-sm font-bold">More from {COMPANY.name}</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              {COMPANY.products.map((p) => (
                <li key={p.name}>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="transition hover:text-neon">
                      {p.name} <span className="text-white/35">— {p.desc}</span>
                    </a>
                  ) : (
                    <span>
                      {p.name} <span className="text-white/35">— {p.desc}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-neon/20" />

        <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-white/40 md:flex-row md:text-left">
          <p>© {year} {COMPANY.legalName}. All rights reserved. Brand names and logos belong to their respective owners.</p>
          <p>
            Made with <span className="text-rose-500">❤️</span> in {COMPANY.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
