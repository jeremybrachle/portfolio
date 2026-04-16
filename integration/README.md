# Portfolio ↔ Project Integration

## Overview

This directory contains handoff documents for connecting each project repo to the portfolio. The system is designed so that:

1. **Current pages are the fallback.** Nothing breaks if a project hasn't been set up yet.
2. **Each project is independent.** One failing project doesn't affect the others.
3. **It scales.** Adding a new project means: create a handoff, send it to the project, consume its manifest.

## Integration Status

| Project | Status | Method |
|---------|--------|--------|
| **Vibe Machine** | **DONE** | Static embed — files copied into `public/vibe-machine/` |
| Co-Stars | Pending | iframe (needs handoff) |
| Multi-Agent | Pending | iframe (needs handoff) |
| APK Archeologist | Pending | static-html (needs handoff) |

## How Vibe Machine Is Connected

**Approach:** Standalone static demo copy (no server, no live link to main repo).

The portfolio contains a **customized demo fork** of Vibe Machine at `public/vibe-machine/`. It is completely independent from the main app at `~/programming/vibe-machine` — changes to one do not affect the other.

### What makes the demo different from the main app:
- **Start screen** — clean "Start the Vibe Machine" button instead of immediate UI
- **5 visualizers** instead of 10 (blank, bars, wave, circular, starry night)
- **Auto vibe mode** — UI hides 3s after music starts
- **Floating play/pause** — appears on hover at bottom of screen in vibe mode
- **Sunrise transition** enabled by default
- **Static tracks** — `tracks.json` file instead of `/api/tracks` server endpoint
- **No server needed** — pure static files served by Vite

### Demo files in portfolio:
```
public/vibe-machine/
  index.html          ← start screen + trimmed viz buttons
  app.js              ← demo logic: start screen, auto-vibe, floating play, tracks.json fetch
  config.js           ← demo defaults: starry night, transition on, 5 modes
  styles.css          ← start screen + floating play button CSS
  tracks.json         ← static track list (replaces /api/tracks)
  visualizers/        ← blank, bars, circular, starrynight, waveform only
  tracks/classical/   ← audio files
```

### Three ways to update:

**A. Edit the demo directly** — change files in `portfolio/public/vibe-machine/`. The demo is self-contained. Best for tweaking demo behavior.

**B. Pull fresh code from main, re-apply patches** — when the main app gets features you want. Copy `vibe-machine/public/*` into the portfolio, then re-apply all demo customizations (start screen, trimmed modes, config, auto-vibe, floating play). Full patch list is in `vibe-machine/portfolio-assets/README.md`.

**C. Switch to live iframe (future)** — delete `public/vibe-machine/`, iframe `http://localhost:5001` or a deployed URL. Requires the main app to run alongside the portfolio. The `X-Frame-Options: SAMEORIGIN` header is already set in the main `server.js`. Would need demo UX changes ported to the main app or accepted as-is.

## Files

| File | Purpose |
|------|---------|
| `PORTFOLIO_INTEGRATION_SPEC.md` | The contract — manifest schema, embed types, fallback chain |
| `PORTFOLIO_HANDOFF_VIBE_MACHINE.md` | → Send to `/home/kerry/programming/vibe-machine` |
| `PORTFOLIO_HANDOFF_COSTARS.md` | → Send to `/home/kerry/programming/co-stars-frontend/costars-frontend` |
| `PORTFOLIO_HANDOFF_MULTI_AGENT.md` | → Send to `/home/kerry/programming/multi-agent` |
| `PORTFOLIO_HANDOFF_APK_ARCHEOLOGIST.md` | → Send to `C:\Users\kerry\Documents\apk-archeologist` |

## Workflow

### Step 1: Send handoffs
Copy each `PORTFOLIO_HANDOFF_*.md` into the corresponding project repo (or just open the project in VS Code and paste it to the agent).

### Step 2: Project processes handoff
In each project's workspace, tell the agent:
> "Read PORTFOLIO_HANDOFF_*.md and do what it says."

The project will:
- Generate `portfolio-manifest.json`
- Create `portfolio-assets/` with screenshots
- Make any required code changes (e.g., X-Frame-Options)
- Report back what was done

### Step 3: Portfolio consumes manifests
Once projects have their manifests, come back here and tell the portfolio agent:
> "The projects have their manifests ready. Wire up the integration."

The portfolio will then build the loader JS that reads manifests and renders embeds with fallbacks.

## Port Assignments

| Project | Port | Command |
|---------|------|---------|
| Portfolio | 4000 | `npx vite --host` |
| Vibe Machine | 5001 | `node server.js 5001` |
| Co-Stars | 5002 | `npx vite --port 5002 --host` |
| Multi-Agent | 5003 | `uvicorn api.server:app --port 5003` |
| APK Archeologist | 5004 | `npx serve web -p 5004` (or static embed) |

## Adding a New Project

1. Copy `PORTFOLIO_INTEGRATION_SPEC.md` for the manifest schema
2. Write a new `PORTFOLIO_HANDOFF_NEW_PROJECT.md`
3. Create a new page in the portfolio (`pages/new-project.html` + `css/new-project.css`)
4. Send the handoff to the project
5. Wire up the manifest consumer
