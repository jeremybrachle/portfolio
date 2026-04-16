# Portfolio Handoff — Co-Stars

## Context

Kerry's portfolio site at `/home/kerry/programming/portfolio` has a page for each project. Your page is **Co-Stars** (`pages/costars.html`) — currently a hot pink cinema theme with film grain overlay, feature cards, and tech badges.

The portfolio wants to embed your actual running game directly into the page so visitors can play Co-Stars right there. If embedding fails (build not served, connection refused, etc.), it falls back gracefully to the current static design.

## What I Need From You

### 1. Generate `portfolio-manifest.json` at your repo root (`costars-frontend/`)

```json
{
  "schema": 1,
  "project": "co-stars",
  "title": "Co-Stars",
  "embed": {
    "type": "iframe",
    "src": "http://localhost:5002",
    "fallback": "summary"
  },
  "summary": {
    "tagline": "Connect actors through shared movies — a graph pathfinding game",
    "description": "A React 19 SPA where players connect actors through their shared filmographies. Uses BFS pathfinding on a movie-actor graph built from TMDB data. Runs fully offline with snapshot data — no backend required.",
    "techStack": ["React 19", "TypeScript", "Vite", "React Router"],
    "features": [
      "Adventure mode with curated difficulty levels",
      "Speed round with countdown timer",
      "Custom level creator",
      "BFS pathfinding with suggestion engine",
      "Write-in autosuggest with fuzzy matching",
      "7 color themes",
      "Offline-first with snapshot data"
    ],
    "architecture": "React SPA with client-side BFS on a pre-computed actor-movie adjacency graph. Data layer uses CloudFront-hosted snapshots with fallback to local demo data. No backend required for gameplay."
  },
  "media": {
    "screenshots": [
      "portfolio-assets/game-board.png",
      "portfolio-assets/home-menu.png",
      "portfolio-assets/level-select.png"
    ],
    "videos": [],
    "thumbnail": "portfolio-assets/thumb.png"
  },
  "github": "https://github.com/jeremybrachle/co-stars",
  "localPath": "/home/kerry/programming/co-stars-frontend/costars-frontend",
  "commands": {
    "install": "npm install",
    "dev": "npx vite --port 5002 --host",
    "build": "npm run build"
  }
}
```

Fill in with your own accurate details — the above is my best guess from reading your code.

### 2. Add an embed mode (optional but nice)

Consider adding a query param `?embed=true` that hides the navigation menu and footer when detected. This makes the iframe presentation cleaner inside the portfolio:

```tsx
// In App.tsx or a layout component
const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';

// Then conditionally hide nav/footer
{!isEmbed && <NavigationMenu />}
{!isEmbed && <Footer />}
```

If the iframe src becomes `http://localhost:5002/?embed=true`, visitors see just the game, not your standalone nav.

**This is optional.** The portfolio will work fine without it — the iframe just shows the full app.

### 3. Verify offline/demo mode works

The portfolio iframe won't have your backend running. Verify that:
- The app boots without the `/api` proxy (no backend on `:8000`)
- Demo/snapshot data loads correctly from `public/data/` or CloudFront
- A visitor can actually play through a level without any backend calls

From what I saw, your `DataSourceModeContext` + `SnapshotDataProvider` handles this, but confirm it works after a fresh `npm run build` + static serve.

### 4. Create `portfolio-assets/` directory with screenshots

```
portfolio-assets/
  game-board.png      (mid-game showing actor/movie tokens on the path)
  home-menu.png       (the landing page with Play Now etc.)
  level-select.png    (adventure mode level cards)
  thumb.png           (400x300-ish thumbnail for portfolio project card)
```

If you can't take screenshots programmatically, create the directory and note which views to capture. Kerry can screenshot manually.

### 5. Confirm the dev port

The portfolio will expect you at `http://localhost:5002`. Verify that `npx vite --port 5002 --host` works. If you need a different port, update the manifest.

Alternatively, for serving a production build:
```bash
npm run build
npx serve dist -p 5002
```

## How The Portfolio Will Use This

1. On dev, Kerry runs `npx vite --port 5002 --host` from your directory (or serves the `dist/`)
2. The portfolio Co-Stars page checks for your iframe src
3. If reachable → shows your full game embedded in the page
4. If not reachable → shows the existing hot pink cinema theme with feature cards
5. On production deploy, the iframe src would point to your CloudFront/S3 URL

## What NOT To Change

- Don't modify your core game logic for this
- Don't break your standalone app to serve the portfolio
- The manifest and assets are the only required new files
- The embed mode is optional

## Report Back

When done, tell me:
1. The manifest file was created at `portfolio-manifest.json`
2. Whether embed mode (`?embed=true`) was added
3. Whether offline/demo mode works standalone
4. What screenshots/assets were created (or what needs manual capture)
5. The confirmed dev port and serve command
6. Any issues or concerns
