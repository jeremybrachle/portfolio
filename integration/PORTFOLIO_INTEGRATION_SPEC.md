# Portfolio Integration Spec

## How This Works

Each project repo receives a `PORTFOLIO_HANDOFF.md` telling it what the portfolio needs. The project reads the handoff, generates a **manifest file** (`portfolio-manifest.json`) and any required assets, then the portfolio consumes them.

### The Contract

Every project produces a `portfolio-manifest.json` at its repo root:

```json
{
  "schema": 1,
  "project": "project-slug",
  "title": "Display Name",
  "embed": {
    "type": "iframe | static-html | summary-only",
    "src": "http://localhost:PORT or relative path to HTML",
    "fallback": "summary"
  },
  "summary": {
    "tagline": "One-line description",
    "description": "2-3 sentence technical summary",
    "techStack": ["Tech 1", "Tech 2"],
    "features": ["Feature 1", "Feature 2"],
    "architecture": "Optional architecture description"
  },
  "media": {
    "screenshots": ["path/to/screenshot-1.png"],
    "videos": [],
    "thumbnail": "path/to/thumb.png"
  },
  "github": "https://github.com/user/repo",
  "localPath": "/home/kerry/programming/project",
  "commands": {
    "install": "npm install",
    "dev": "node server.js 5001",
    "build": "npm run build"
  }
}
```

### Embed Types

| Type | What it means | Portfolio behavior |
|------|---------------|-------------------|
| `iframe` | Project can run on a local port or static URL | Show live iframe, fall back to summary on error |
| `static-html` | Project provides a self-contained HTML file | Inline it or iframe from local path |
| `summary-only` | CLI tool / no visual UI | Show rich technical summary with media |

### Fallback Chain

```
iframe loads? → show live embed
    ↓ no
static-html exists? → show static version
    ↓ no
manifest exists? → show summary from manifest data
    ↓ no
hardcoded fallback → show current page content (what exists today)
```

The current portfolio pages ARE the fallback. Nothing breaks if a project hasn't generated its manifest yet.

### Media Convention

Projects should place portfolio assets in a `portfolio-assets/` directory:

```
project-root/
  portfolio-assets/
    screenshot-1.png
    screenshot-2.png
    thumb.png
    demo.mp4  (optional)
  portfolio-manifest.json
```

The portfolio will copy/reference these during build or dev.

---

## Per-Project Integration Plan

### Vibe Machine (Home Page)
- **Embed type:** `iframe`
- **How:** Run `node server.js 5001` → iframe at `http://localhost:5001`
- **Required change in project:** Remove `X-Frame-Options: DENY` from `server.js` security headers (change to `SAMEORIGIN`)
- **Fallback:** Current cosmic purple visualizer bars + audio player
- **Assets needed:** 2-3 screenshots of different visualizer modes, thumbnail

### Co-Stars (Co-Stars Page)
- **Embed type:** `iframe`
- **How:** `npm run build` → serve `dist/` on port 5002 → iframe. Runs in demo/snapshot mode, no backend needed.
- **Fallback:** Current hot pink cinema theme with feature cards
- **Assets needed:** Screenshot of game board, screenshot of level select, thumbnail
- **Nice to have:** An `?embed=true` query param that hides nav/footer for cleaner iframe presentation

### Multi-Agent Lab (Multi-Agent Page)
- **Embed type:** `iframe`
- **How:** `uvicorn api.server:app --port 5003` → iframe at `http://localhost:5003`
- **Fallback:** Current CRT terminal theme with pipeline visualization
- **Assets needed:** Screenshot of dashboard, screenshot of circuit visualizer, thumbnail
- **Note:** Dashboard is a single self-contained HTML file, but needs the API running to function

### APK Archeologist (APK Archeologist Page)
- **Embed type:** `static-html`
- **How:** The `web/` demo is fully self-contained — the side-by-side comparison viewer with playable games needs no server
- **Fallback:** Current amber retro theme with dig layers
- **Assets needed:** Screenshot of comparison viewer, screenshot of Dino Dash game, thumbnail
- **Bonus:** Could also show a sample `report.md` rendered inline

---

## What Each Project Needs To Do

Each project will receive a `PORTFOLIO_HANDOFF.md` with:

1. What the portfolio expects (this contract)
2. Specific instructions for that project
3. What to generate (manifest + assets)
4. What modifications to make (if any, like X-Frame-Options)

The project reads the handoff, makes changes, generates the manifest and assets, and reports back what it produced.
