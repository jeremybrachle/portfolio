# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] — 2026-04-30

### Added
- **Vibe Check** project section (`#section-vibecheck`) with live Hacker News Firebase API demo and curated LLM rankings dashboard
- GitHub repository links across project sections:
  - Vibe Machine → `jeremybrachle/vibe-machine` (red theme)
  - Vibe Check Frontend → `jeremybrachle/vibe-check-front-end` (green)
  - Vibe Check API → `jeremybrachle/vibe-check` (cyan)
- Mini-player **prev/next** track controls and **minimize** button (collapses to a 56×56 🎧 puck pinned bottom-right)
- Favicon (SVG 🎧 emoji), Open Graph + Twitter card metadata, page description
- AWS deployment pipeline:
  - `.github/workflows/deploy.yml` — S3 + CloudFront deploy via OIDC, three-tier cache strategy (HTML no-cache, hashed assets immutable 1yr, vibe-machine 5min); gated on tests + post-build verification
  - `.github/workflows/ci.yml` — runs tests, build, and post-build verifier on PRs and non-main pushes; uploads `dist/` as artifact
  - `aws/cloudfront-response-headers.json` — HSTS, X-Content-Type-Options, X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy
- Test infrastructure (Vitest + happy-dom):
  - `tests/sanitize.test.js` — 26 unit tests for `escapeHtml`, `safeUrl`, `safeInt`, `isValidHnId`, `clampStr`, `fmtDuration` (XSS payloads, scheme rejection, length caps, NaN/Infinity)
  - `tests/html-structure.test.js` — 26 integration tests for required sections, GitHub repo links, mini-player markup, head metadata (CSP, favicon, OG/Twitter, referrer)
  - `tests/postmessage.test.js` — 8 tests for source/origin validation and seek-percent clamping
  - `tests/verify-build.mjs` — post-build CLI verifier (32 checks: required dist files, head metadata, all 7 sections, mini-player, all 6 GitHub links, hashed bundles, no placeholder leaks)
  - `npm run verify` — one-shot `test → build → verify-build` pipeline
- `public/js/lib/sanitize.js` — pure ESM helpers extracted from `vibe-check.js` for DRY between runtime and tests
- `PORTFOLIO_DEPLOY.md` — code-done vs AWS-todo deployment checklist

### Changed
- Default Vibe Machine visualizer switched to **Circular** (`config.js: defaultVisualizer: 3`)
- Waveform visualizer: removed white grid lines; opacity now fades during sunrise transition via `window.__vibeOverlayAlpha`
- Moved `js/` → `public/js/` so Vite ships the player as a static asset (was being skipped by the bundler)
- Vibe Machine "Try it out on the home page" link now uses `.vibe-link` class with themed underline color

### Security
- Hardened `postMessage` bridge: validates `e.source === iframe.contentWindow && e.origin === window.location.origin` on both portfolio and embed sides; `parentOrigin` pinned in `portfolio-embed.js`
- Throttled iframe `vm-freq` broadcasts to 1 Hz when minimized (`idle` command)
- Validated seek values clamped to `[0, 100]` before postMessage dispatch
- Vibe Check input hardening: `safeUrl()` (URL parse, http/https only, 2048 char cap), `safeInt()` clamp, `isValidHnId()`, `clampStr()` (300 char cap); `fetchJson` uses `credentials: omit`, `referrerPolicy: no-referrer`, `cache: no-store`
- All external anchors use `rel="noopener noreferrer"` (user-content links add `nofollow ugc`)
- Content Security Policy meta tag added: `default-src 'self'; script-src 'self' 'unsafe-inline'`

### Removed
- Stale `js/` top-level directory (now under `public/js/`)
- Throwaway scratch scripts (`_tmp_add_buttons.sh`, `_tmp_minimize.py`, `portfolio-refresher.md`)

## [1.0.0] — 2026-04-16

### Added
- Single-page architecture — all six pages merged into one `index.html` with CSS class toggling
- Section switcher (`main.js`) with `pushState` for bookmarkable deep links
- Persistent Vibe Machine iframe that never leaves the DOM — audio survives all navigation
- CSS `position: fixed` overlay strategy for mounting the visualizer on home without `appendChild` (which reloads iframes)
- `requestAnimationFrame` loop to track `#visualizer` bounding rect so the iframe stays aligned on scroll/resize
- Draggable mini-player with EQ visualizer on all non-home sections
- `postMessage` bridge between portfolio and Vibe Machine iframe (`portfolio-embed.js`)
- Starry Night set as default visualizer
- Themed backgrounds per section via `.page-bg` class swapping
- Vite SPA mode (`appType: 'spa'`) so all routes resolve to `index.html`
- Easter egg overlay on the portfolio section
- Self-reading quine script on the portfolio section
- GitHub API mirror fetch on the portfolio section

### Architecture
- **Before:** Six separate HTML pages, Vite multi-page build, iframe destroyed on every navigation
- **After:** One HTML file, six `<section class="page-section">` elements, zero page loads after initial, iframe permanently in `document.body`
