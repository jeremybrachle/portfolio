# Portfolio — Agent Handoff

## What exists

A 5-page portfolio site built with Vite (vanilla JS, no framework). Each page has a unique visual theme and describes one of Kerry's projects with real descriptions pulled from their READMEs. Dev server runs at `http://localhost:4000` via `npx vite --host` from WSL.

## Pages and their state

### Home (`index.html`)
- **Theme:** Cosmic purple with animated gradient background
- **Content:** Hero with title/subtitle, 48 animated CSS visualizer bars, audio player for Clair de Lune, project card grid linking to all 4 projects + the portfolio itself
- **Audio:** Player UI exists but needs the actual MP3 at `public/audio/clair-de-lune.mp3` (currently only `.gitkeep` in that directory)
- **JS:** `js/home.js` generates bars with randomized sizing/timing and handles audio play/pause with autoplay fallback (~85 lines)
- **Vibe Machine card:** Links to `https://github.com/jeremybrachle/vibe-machine`

### Co-Stars (`pages/costars.html`)
- **Theme:** Hot pink cinema with film grain SVG overlay
- **Content:** Description, tech badges (React 19, TypeScript, Vite, FastAPI, SQLite), film-strip decoration, feature cards (pathfinding, levels, suggestions, snapshots, UI, TMDB data)
- **GitHub links:** Frontend + Backend — both set
- **Scaffold ready for:** Embedding the React frontend in `.demo-placeholder` (works offline via snapshot mode)

### Multi-Agent Lab (`pages/multi-agent.html`)
- **Theme:** Green CRT terminal with scanlines, Fira Code font, blinking cursor
- **Content:** Description ("paste text → watch agents analyze in real time"), pipeline visualization (4 agents), tech badges (Python 3.11+, FastAPI, SSE, Uvicorn), feature cards
- **GitHub link:** `https://github.com/jeremybrachle/multi-agent` — set
- **Scaffold ready for:** Embedding the FastAPI dashboard or a static replay in `.demo-placeholder`

### APK Archeologist (`pages/apk-archeologist.html`)
- **Theme:** Amber retro with Press Start 2P pixel font, grid overlay, archaeological dig layers
- **Content:** Description ("extract endpoint DNA from compiled amber"), tech badges (TypeScript, Node.js 18+, CLI, JADX), dig-layer pipeline visualization, feature cards
- **GitHub link:** `https://github.com/jeremybrachle/apk-archaeologist` — set
- **Scaffold ready for:** Embedding a sample report or terminal recording in `.demo-placeholder`

### This Portfolio (`pages/portfolio.html`)
- **Theme:** Cyan/electric blue — "The Impossible Building"
- **Centerpiece:** Full SVG isometric building with Penrose-style impossible staircases:
  - Stairs go up the left wall, across the top landing, down the right wall, and impossibly loop back to the bottom
  - The reconnection edge pulses with a dashed CSS animation
  - 5 animated glowing particles (cyan dots) travel the staircase paths at different speeds
  - 5 `<textPath>` elements carry real code snippets along the stairs — populated at **runtime** by an inline script that reads `document.documentElement.outerHTML`, filters for interesting lines, and injects them into the SVG. The building literally carries the blueprints that built it.
  - Step labels on each tread: `<html>` → `<head>` → `<link css>` → `<body>` → `.building-stage` → `.stair-tread` → `render()` → `→ paint` → `→ output` → `→ <html>` (the impossible loop)
- **Sections:** Hero, SVG building + caption, "The Paradox" about block, tech badges, 6 feature cards
- **GitHub link:** `https://github.com/jeremybrachle/portfolio` — set
- **Tone:** Self-aware, describes itself as an impossible object that carries its own source

## Navigation

Floating glassmorphic dock fixed at the bottom of every page. Five links, each with a color-coded glowing dot:
- Purple → Home
- Pink → Co-Stars
- Green → Multi-Agent
- Orange → APK Archeologist
- Cyan → This Site

Active state set in HTML (`class="active"`) and by `js/main.js` at runtime based on URL. On mobile (≤640px) text labels hide, only dots remain.

## Architecture

```
index.html              ← Home
pages/
  costars.html
  multi-agent.html
  apk-archeologist.html
  portfolio.html
css/
  global.css            ← Reset, nav dock, shared utilities
  home.css
  costars.css
  multi-agent.css
  apk-archeologist.css
  portfolio.css
js/
  main.js               ← Nav active state (shared, 21 lines)
  home.js               ← Visualizer bars + audio (~85 lines)
public/
  audio/
    .gitkeep            ← Needs clair-de-lune.mp3
vite.config.js          ← Multi-entry, port 4000
package.json            ← Only dep: vite ^5.4.0
```

## File locations of source projects

| Project | Location | GitHub |
|---------|----------|--------|
| Vibe Machine | `/home/kerry/programming/vibe-machine` | https://github.com/jeremybrachle/vibe-machine |
| Co-Stars Backend | `/home/kerry/programming/co-stars-backend` | https://github.com/jeremybrachle/co-stars-backend |
| Co-Stars Frontend | `/home/kerry/programming/co-stars-frontend` | https://github.com/jeremybrachle/co-stars-frontend |
| Multi-Agent Lab | `/home/kerry/programming/multi-agent` | https://github.com/jeremybrachle/multi-agent |
| APK Archeologist | `C:\Users\kerry\Documents\apk-archeologist` | https://github.com/jeremybrachle/apk-archaeologist |
| This Portfolio | `/home/kerry/programming/portfolio` | https://github.com/jeremybrachle/portfolio |

## What needs doing next

### Blocking (must do before deploy)
1. **Clair de Lune MP3** — Download a public-domain recording and place at `public/audio/clair-de-lune.mp3`. Recommended sources: Musopen, IMSLP, Archive.org.
2. **Test the build** — `npx vite build` then `npx vite preview` from WSL. Confirm all 5 pages load, nav works, assets resolve.
3. **Deploy** — Pick a host (GitHub Pages, Vercel, or Netlify). Details in `PORTFOLIO_DEPLOY.md`.

### Should do
4. **Favicon** — Add to every page `<head>`. Quickest: SVG emoji favicon.
5. **Open Graph meta tags** — For link previews when shared.
6. **Responsive pass** — Test at 375px / 768px. Nav dock collapses to dots on mobile, but page content needs verification.

### Demo integration (per project, not blocking launch)
7. **Vibe Machine** — Copy Canvas + Web Audio JS into `.visualizer-stage` on home, or iframe a deployed instance
8. **Co-Stars** — Build React app, deploy separately, iframe into `.demo-placeholder` (works offline via snapshots)
9. **Multi-Agent Lab** — Build a static replay that simulates SSE events from saved pipeline JSON, embed in `.demo-placeholder`
10. **APK Archeologist** — Render a sample `report.md` as styled HTML, or embed an asciinema recording

### Polish backlog
11. Page transitions (View Transitions API)
12. About / contact section (home page or own page)
13. Analytics (Plausible or Umami, optional)

## Commands

```bash
# All commands run from WSL
cd /home/kerry/programming/portfolio

npm install          # first time only
npx vite --host      # dev → http://localhost:4000
npx vite build       # production build → dist/
npx vite preview     # preview the production build

# Do NOT run from Windows PowerShell — esbuild breaks over UNC paths
```

## User preferences (from Kerry)
- Do NOT start servers — Kerry will do it themselves
- No linting/ruff — considered overkill
- Prefers understanding tools before committing
- Working in WSL Ubuntu from Windows VS Code
