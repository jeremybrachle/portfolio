# Changelog

All notable changes to this project will be documented in this file.

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
