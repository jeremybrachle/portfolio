# Portfolio Handoff — Multi-Agent Lab

## Context

Kerry's portfolio site at `/home/kerry/programming/portfolio` has a page for each project. Your page is **Multi-Agent Lab** (`pages/multi-agent.html`) — currently a green CRT terminal theme with scanlines, a pipeline visualization, and feature cards.

The portfolio wants to embed your actual dashboard directly into the page so visitors can paste text, run the pipeline, and watch the agents analyze in real time. If embedding fails (server not running, etc.), it falls back gracefully to the current static design.

## What I Need From You

### 1. Generate `portfolio-manifest.json` at your repo root

```json
{
  "schema": 1,
  "project": "multi-agent",
  "title": "Multi-Agent Lab",
  "embed": {
    "type": "iframe",
    "src": "http://localhost:5003",
    "fallback": "summary"
  },
  "summary": {
    "tagline": "Paste text, watch agents analyze in real time",
    "description": "A FastAPI pipeline with 4 rule-based Python agents (extractor, summarizer, critic, sentiment) that process documents in sequence. SSE streaming powers a real-time dashboard with a circuit-board visualizer showing data flow between agents.",
    "techStack": ["Python 3.11+", "FastAPI", "SSE", "Uvicorn"],
    "features": [
      "4 rule-based agents (extractor, summarizer, critic, sentiment)",
      "Real-time SSE streaming of pipeline execution",
      "Circuit-board visualizer with animated data flow",
      "Drag-to-reorder pipeline stages",
      "Per-agent JSON output with timing metrics",
      "Sequential orchestration (~50ms total)"
    ],
    "architecture": "FastAPI serves a single-page dashboard (inline HTML/CSS/JS). POST /api/analyze/stream returns SSE events as each agent processes. The circuit visualizer renders on Canvas with particle effects. All agents are pure Python — no LLMs, no cloud APIs."
  },
  "media": {
    "screenshots": [
      "portfolio-assets/dashboard.png",
      "portfolio-assets/circuit-visualizer.png",
      "portfolio-assets/results.png"
    ],
    "videos": [],
    "thumbnail": "portfolio-assets/thumb.png"
  },
  "github": "https://github.com/jeremybrachle/multi-agent",
  "localPath": "/home/kerry/programming/multi-agent",
  "commands": {
    "install": "pip install -e '.[api]'",
    "dev": "uvicorn api.server:app --port 5003",
    "build": null
  }
}
```

Fill in with your own accurate details — the above is my best guess from reading your code.

### 2. Verify no iframe-blocking headers

From my read of `api/server.py`, there are no `X-Frame-Options` or `Content-Security-Policy: frame-ancestors` headers being set. Confirm this is still the case. If any have been added, change to `SAMEORIGIN` or remove.

### 3. Pre-load sample text

The dashboard has a "Load Sample" button. Verify it works so visitors can click one button and immediately see the pipeline run. If the sample text is hardcoded in `dashboard.html`, great — no changes needed. If it loads from an endpoint, make sure it works without any external data.

### 4. Create `portfolio-assets/` directory with screenshots

```
portfolio-assets/
  dashboard.png           (full dashboard view with pipeline strip at top)
  circuit-visualizer.png  (the "Open Hood" canvas animation mid-execution)
  results.png             (results panel after a pipeline run)
  thumb.png               (400x300-ish thumbnail for portfolio project card)
```

If you can't take screenshots programmatically, create the directory and note which views to capture. Kerry can screenshot manually.

### 5. Confirm the dev port

The portfolio will expect you at `http://localhost:5003`. Verify that `uvicorn api.server:app --port 5003` works. If you need a different port, update the manifest.

### 6. Note about the circuit visualizer bug

The HANDOFF.md mentions the circuit visualizer doesn't replay correctly on consecutive pipeline runs. This is fine for portfolio purposes — visitors will likely only run it once. But if you've fixed it since, great.

## How The Portfolio Will Use This

1. On dev, Kerry runs `uvicorn api.server:app --port 5003` from your directory
2. The portfolio Multi-Agent page checks for your iframe src
3. If reachable → shows your full dashboard embedded in the page
4. If not reachable → shows the existing CRT terminal theme with feature cards
5. On production deploy, the iframe src would point to your deployed AWS URL

## What NOT To Change

- Don't modify your core agents or pipeline for this
- Don't add portfolio-specific routes to server.py
- The manifest and assets are the only new files needed
- No code changes required (assuming no iframe-blocking headers)

## Report Back

When done, tell me:
1. The manifest file was created at `portfolio-manifest.json`
2. Confirmed no iframe-blocking headers
3. Sample text / "Load Sample" works standalone
4. What screenshots/assets were created (or what needs manual capture)
5. The confirmed dev port
6. Status of the circuit visualizer replay bug
7. Any issues or concerns
