# Portfolio Deploy — Next Steps

## Pre-deploy checklist

### Must fix before going live
- [ ] **Clair de Lune MP3** — Download a public-domain recording and drop at `public/audio/clair-de-lune.mp3`. Recommended: [Musopen](https://musopen.org), [IMSLP](https://imslp.org), or [Archive.org](https://archive.org). Without this the audio player on the home page is a dead control.
- [ ] **Test the build** — Run `npx vite build` then `npx vite preview` from WSL. Confirm all 5 pages load, nav works, and assets resolve.
- [ ] **Favicon** — Add one. Quickest option is an SVG emoji favicon in each `<head>`:
  ```html
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧪</text></svg>">
  ```

### Should do
- [ ] **Open Graph meta tags** — Add to every page `<head>` so link previews look good when shared:
  ```html
  <meta property="og:title" content="Kerry's Portfolio" />
  <meta property="og:description" content="Builder of games, tools, and weird experiments." />
  <meta property="og:type" content="website" />
  <!-- <meta property="og:image" content="https://yourdomain.com/og-image.png" /> -->
  ```
- [ ] **Responsive pass** — Nav dock collapses to dots on mobile but the page content needs testing at 375px / 768px widths.

---

## Hosting options

### Option A: GitHub Pages (simplest, free)

1. Push the repo to `github.com/jeremybrachle/portfolio` (or it's already there).
2. No `base` config needed if deploying to a custom domain or `jeremybrachle.github.io` root. If deploying to `jeremybrachle.github.io/portfolio/`, add to `vite.config.js`:
   ```js
   base: '/portfolio/',
   ```
3. Add a GitHub Actions workflow. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   concurrency:
     group: pages
     cancel-in-progress: true
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: dist
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
4. In the repo's Settings → Pages, set source to **GitHub Actions**.
5. Push to `main` and it auto-deploys.

### Option B: Vercel (easiest auto-deploy)

1. Go to [vercel.com](https://vercel.com), import the `portfolio` repo.
2. Framework preset: **Vite**. It auto-detects the build command.
3. No config changes needed — Vercel handles it.
4. Get a `*.vercel.app` URL immediately, optional custom domain later.

### Option C: Netlify

1. Go to [netlify.com](https://netlify.com), import the repo.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Works out of the box. Free tier is fine.

---

## Custom domain (optional, any host)

1. Buy a domain (Namecheap, Cloudflare, Google Domains).
2. Point DNS:
   - **GitHub Pages:** CNAME to `jeremybrachle.github.io`, add a `CNAME` file in `public/` with the domain.
   - **Vercel/Netlify:** Follow their custom domain UI, update DNS A/CNAME records as directed.
3. Enable HTTPS (free and automatic on all three hosts).

---

## After deploy — demo integration (not blocking)

These make the portfolio more impressive but aren't needed for launch:

| Project | Strategy | Effort |
|---------|----------|--------|
| **Vibe Machine** | Iframe a deployed instance into `.visualizer-stage` on the home page, or copy the Canvas + Web Audio JS directly | Medium |
| **Co-Stars** | `npm run build` in `co-stars-frontend`, deploy as a separate Vercel/Netlify app, iframe into `.demo-placeholder` — works offline via snapshot mode | Medium |
| **Multi-Agent Lab** | Build a static replay that simulates SSE events from a saved pipeline JSON, embed in `.demo-placeholder` — no backend needed | Medium |
| **APK Archeologist** | Render a sample `report.md` as styled HTML, or embed an [asciinema](https://asciinema.org) terminal recording | Easy |

---

## Polish backlog

- [ ] Page transitions — View Transitions API for cross-page animations
- [ ] About / contact section — Could be added to the home page below project cards
- [ ] Analytics — Plausible or Umami for privacy-friendly tracking (optional)

---

## Commands reference

```bash
# All commands run from WSL
cd /home/kerry/programming/portfolio

npm install          # first time only
npx vite --host      # dev → http://localhost:4000
npx vite build       # production build → dist/
npx vite preview     # preview the production build

# Do NOT run from Windows PowerShell — esbuild breaks over UNC paths
```
