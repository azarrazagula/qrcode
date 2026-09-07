# AiTechies QR Studio

An [AiTechies Studio](https://ansaribrahim.me/) product. Free, print-ready QR code cards for shops and small businesses. Pick a platform, paste your link, download a card designed for the counter, door or table.

**Supported:** Google Review · Google Maps · Instagram · WhatsApp · Facebook · YouTube · TikTok · X · Threads · LinkedIn · Telegram · Snapchat · Pinterest · Spotify · Website · Digital menu · UPI payment · Zomato · Swiggy · Wi-Fi · Phone · SMS · Email · Contact card (vCard) · Play Store · App Store · any link · plain text.

## Features

- **Smart inputs** — type `@yourshop` or paste a full profile link; phone numbers get the country code; Google Place IDs become review links; Wi-Fi, UPI and vCard payloads are built and escaped correctly.
- **Designer QR codes** — rounded-dot modules, brand-coloured finder eyes, platform icon or your logo in the centre, three dot styles. Drawn as plain SVG primitives (no raster), so they stay crisp at any print size.
- **Print-ready cards** — five templates (Classic, Bold, Minimal, Night, Sticker) in A6, A5, A4, square sticker, landscape counter stand and 1080×1920 phone-story sizes. Everything is rendered as SVG, so the preview *is* the print.
- **Exports** — PNG/JPG at 300 DPI, true vector SVG, PDF via the print dialog, plain QR (PNG/JPG/SVG), and native share to WhatsApp on phones.
- **Print sheets** — one card per page at the exact physical size, or fill an A4 sheet with as many copies as fit, with cut lines.
- **Branding** — platform icon or your own logo in the centre of the code, brand-colour palettes, contrast warning when a colour combination will scan badly.
- **Recent designs** are kept in the browser; the current design is also encoded in the URL so it can be bookmarked or sent to a print shop.
- **Private** — nothing leaves the browser. No accounts, no server, static codes that never expire.

## Development

```bash
npm install
npm start        # http://localhost:3000
npm test         # unit tests for the link builders
npm run build    # production build in ./build
```

Stack: Create React App, React 19, Tailwind CSS 3, `qrcode-generator`, `react-icons`.

## Project layout

```
src/
  App.jsx                  state, URL sharing, print orchestration
  data/platforms.js        platform presets (icon, colour, fields, builder, CTA)
  data/design.js           templates, physical formats, defaults
  lib/builders.js          input → QR payload (URLs, wa.me, WIFI:, upi://, vCard…)
  lib/export.js            SVG serialisation, rasterising, download, share
  lib/print.js             A4 sheet layout maths
  lib/share.js             URL-hash state encoding
  lib/storage.js           recent designs (localStorage)
  components/QrArt.jsx     designer QR renderer (dots, eyes, logo excavation)
  components/QrCard.jsx    the SVG card renderer (all templates & formats, AiTechies signature)
  components/*             picker, form, design panel, preview, print sheet, history
```

## Deploying

The build is fully static. Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages). Set `"homepage"` in `package.json` if you serve from a sub-path.

---

© AITechies Studio · Made with ❤️ in Tamil Nadu, India. Brand identity (logo, colours, fonts) is shared with the company site; see `src/data/company.js` and `src/components/Brand.jsx`. Third-party brand names and logos belong to their respective owners.
