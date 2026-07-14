# World Meeting Time Planner

A free, static (no build step) drag-timeline tool for comparing local time across
multiple cities — default set: Beijing, London, Zurich, New York — to help schedule
international meetings. Bilingual UI: English (default) / German toggle.

## Run locally

Just open `index.html` in a browser, or serve the folder with any static server, e.g.:

```
npx serve .
```

## Deploy

Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3, etc.) —
upload the folder as-is.

Before going live:

1. Replace every `https://example.com/` occurrence (in `index.html`, `robots.txt`,
   `sitemap.xml`) with your real domain.
2. Add your Google AdSense `<ins>` snippet inside the three `.ad-slot` placeholders
   in `index.html` (marked with `TODO`/comment blocks) once your AdSense account is
   approved.
3. Optionally add an `og:image` / Twitter image and a real favicon.

## Structure

- `index.html` — page markup, SEO meta tags, JSON-LD structured data, ad slot
  placeholders, and the How-to/Use-cases/FAQ content sections.
- `css/style.css` — styling (dark/light auto, responsive).
- `js/i18n.js` — English/German text dictionary.
- `js/app.js` — city database, timezone conversion (via `Intl.DateTimeFormat`,
  DST-aware), drag interaction, add/remove city, language toggle, localStorage
  persistence.

## Notes

- Only the four default cities (Beijing/Shanghai, London, Zurich, New York) are
  preloaded; 11 more are available via "Add city", and the `CITY_DB` array in
  `js/app.js` can be extended with any IANA time zone.
- The SEO copy and FAQPage structured data are in English by default; the German
  translations exist in the UI toggle but aren't separately indexed (a single-page
  toggle isn't crawled as two documents). For stronger German SEO later, consider a
  separate `/de/` route with server-rendered German meta tags.
