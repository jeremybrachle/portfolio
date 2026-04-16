# Portfolio — Agent Handoff

## What exists

A 5-page portfolio site scaffolded with Vite (vanilla JS, no framework). Each page has a unique visual theme and describes one of Kerry's projects with real descriptions pulled from their READMEs. Everything runs at `http://localhost:4000` via `npx vite --host` from WSL.

## Pages and their state

### Home (`index.html`)
- **Theme:** Cosmic purple with animated gradient background
- **Content:** Hero with title/subtitle, fake visualizer bars (48 animated CSS bars), audio player for Clair de Lune, project card grid linking to all 4 projects
- **Scaffold ready for:**
  - Dropping in the real Vibe Machine canvas (replace the `.visualizer-stage` contents)
  - Adding an MP3 to `public/audio/clair-de-lune.mp3`
- **JS:** `js/home.js` handles bar generation and audio play/pause with autoplay fallback
- **Vibe Machine card:** Links to `https://github.com/jeremybrachle/vibe-machine`

### Co-Stars (`pages/costars.html`)
- **Theme:** Hot pink cinema with film grain SVG overlay
- **Content:** Description, tech badges, film-strip decoration, feature cards (pathfinding, levels, suggestions, snapshots, UI, TMDB data)
- **Scaffold ready for:**
  - Embedding the React frontend in the `.demo-placeholder` (works offline via snapshot mode)
  - ~~Setting the GitHub link href~~ DONE → Frontend + Backend links

### Multi-Agent Lab (`pages/multi-agent.html`)
- **Theme:** Green CRT terminal with scanlines, Fira Code font, blinking cursor
- **Content:** Description, pipeline visualization (4 agents with icons/descriptions), feature cards (pipeline context, SSE, dual interface, performance, registry, local)
- **Scaffold ready for:**
  - Embedding the FastAPI dashboard or a recorded replay in the `.demo-placeholder`
  - ~~Setting the GitHub link href~~ DONE → `https://github.com/jeremybrachle/multi-agent`

### APK Archeologist (`pages/apk-archeologist.html`)
- **Theme:** Amber retro with Press Start 2P pixel font, grid overlay, archaeological dig layers
- **Content:** Description, dig-layer pipeline visualization (6 stages), supported engines table, feature cards
- **Scaffold ready for:**
  - Embedding a sample analysis report or terminal recording in the `.demo-placeholder`
  - ~~Setting the GitHub link href~~ DONE → `https://github.com/jeremybrachle/apk-archaeologist`

### This Portfolio (`pages/portfolio.html`)
- **Theme:** Cyan/electric blue recursive Inception theme — "a website within a website"
- **Content:** Self-referential description, nested Droste-effect recursion frames (5 levels deep ending in RecursionError), meta commentary block written as code comments, feature cards about the portfolio's own architecture
- **Tone:** Playfully self-aware, knows it's staring at itself, has a defined base case ("you smiled")
- **GitHub link:** `https://github.com/jeremybrachle/portfolio`

## Navigation

A floating glassmorphic dock at the bottom of every page. Each link has a color-coded dot (purple/pink/green/orange/cyan). Active state is set both in HTML (`class="active"`) and by `js/main.js` at runtime based on URL. Five entries: Home, Co-Stars, Multi-Agent, APK Archeologist, This Site.

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

### High priority
1. ~~**GitHub repo URLs**~~ DONE — All `.github-link` elements now have real URLs. Co-Stars has separate Frontend/Backend links.
2. **Clair de Lune MP3** — Download a PD recording and place at `public/audio/clair-de-lune.mp3`
3. **Deployment plan** — Decide hosting (GitHub Pages, Vercel, Netlify) and configure `vite.config.js` base path if needed

### Demo integration (per project)
4. **Vibe Machine** — Copy `public/`, `server.js` canvas logic into the `.visualizer-stage` on the home page, or iframe it from a deployed instance
5. **Co-Stars** — Build the React app (`npm run build` in `co-stars-frontend`), embed as iframe or mount at a sub-path. It works offline with snapshot data — no backend needed for the demo
6. **Multi-Agent Lab** — Either deploy the FastAPI backend and iframe the dashboard, or build a static replay that simulates SSE events from a saved pipeline run
7. **APK Archeologist** — Render a sample `report.md` output as HTML, or embed an asciinema terminal recording

### Polish
8. **Responsive testing** — Nav dock collapses to dot-only on mobile, but pages need a pass at small widths
9. **Meta tags** — Add Open Graph / Twitter card meta for link previews
10. **Favicon** — Add a favicon (consider using an emoji favicon with SVG)
11. **Page transitions** — Currently just a CSS fade-in. Could add view transitions API or a shared-layout animation
12. **About/contact section** — Not yet created. Could be a section on the home page or its own page

## Commands

```bash
# Dev
cd /home/kerry/programming/portfolio
npm install          # one time
npx vite --host      # http://localhost:4000

# Build
npx vite build       # → dist/
npx vite preview     # preview the build

# Must run from WSL — Windows npm breaks esbuild over UNC paths
```

## User preferences (from Kerry)
- Do NOT start servers — Kerry wants to do it themselves
- No linting/ruff — considered overkill
- Prefers understanding tools before committing
- Working in WSL Ubuntu from Windows VS Code
