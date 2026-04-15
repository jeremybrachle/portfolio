# Kerry's Portfolio

A personal portfolio site showcasing four software projects — each page has its own visual theme and personality.

## Projects

| Page | Project | Theme |
|------|---------|-------|
| **Home** (`/`) | Vibe Machine — real-time audio visualizer | Cosmic purple, animated bars, Web Audio |
| **Co-Stars** (`/pages/costars.html`) | Actor→movie connection game | Hot pink cinema, film grain overlay |
| **Multi-Agent** (`/pages/multi-agent.html`) | Document analysis pipeline | Green CRT terminal, scanlines |
| **APK Archeologist** (`/pages/apk-archeologist.html`) | Mobile game preservation CLI | Amber retro pixel, excavation motif |

## Quick Start

```bash
# From WSL
cd /home/kerry/programming/portfolio

# Install (one time)
npm install

# Dev server with hot reload
npx vite --host
# → http://localhost:4000

# Production build
npx vite build
# → outputs to dist/

# Preview production build
npx vite preview --host
```

> **Windows note:** Run `npm install` and `vite` from inside WSL (`wsl bash -ic "..."`) — npm over UNC paths breaks esbuild.

## Structure

```
portfolio/
├── index.html                  # Home page (Vibe Machine stage)
├── pages/
│   ├── costars.html            # Co-Stars project page
│   ├── multi-agent.html        # Multi-Agent Lab project page
│   └── apk-archeologist.html   # APK Archeologist project page
├── css/
│   ├── global.css              # Floating nav dock + shared utilities
│   ├── home.css                # Cosmic purple theme
│   ├── costars.css             # Hot pink cinema theme
│   ├── multi-agent.css         # Green CRT terminal theme
│   └── apk-archeologist.css    # Amber retro pixel theme
├── js/
│   ├── main.js                 # Nav state management (all pages)
│   └── home.js                 # Visualizer bars + audio player
├── public/
│   └── audio/                  # Drop clair-de-lune.mp3 here
├── vite.config.js              # Multi-page Vite config
└── package.json
```

## Audio Setup

The home page has a player for Debussy's *Clair de Lune* (1890, public domain). Drop a PD recording at:

```
public/audio/clair-de-lune.mp3
```

Free sources for PD recordings:
- [Musopen](https://musopen.org)
- [IMSLP](https://imslp.org)
- [Internet Archive](https://archive.org)

## Tech Stack

- **Vite** — dev server + build
- **Vanilla JS** — no framework, ES modules
- **CSS** — custom per-page themes, no preprocessor
- **Zero runtime dependencies**

## Status

Scaffolded and running. Project demos are placeholders — ready for actual code integration and deployment.
