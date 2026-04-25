/**
 * Vibe Check — API client
 *
 * Set API_BASE to wherever the Vibe Check backend is running.
 * Local dev:  http://127.0.0.1:8000
 * EC2:        http://<your-ec2-ip>:8000
 * Domain:     https://api.yourdomain.com
 */
const API_BASE = "http://127.0.0.1:8000";
const LAST_DIGEST_KEY = "vibecheck:lastDigest";

// Outdated sample payload shown only when the API is unavailable.
const EXAMPLE_DIGEST = {
  kind: "daily",
  created_at: "2026-04-21T14:30:00Z",
  generated_at: "2026-04-21T14:30:00Z",
  item_count: 126,
  llm_provider: "openai",
  run_origin: "scheduler",
  ai_summary:
    "AI engineering discussion is trending toward pragmatic reliability work: eval harnesses, retrieval quality, cost discipline, and small-team deployment patterns over model novelty.",
  excitement_score: 0.72,
  skepticism_score: 0.34,
  today_themes: [
    "Agent reliability",
    "Eval-driven development",
    "On-device inference",
    "Inference cost controls",
    "Developer tooling acceleration",
  ],
  most_mentioned_tools: [
    "OpenAI API",
    "Anthropic Claude",
    "vLLM",
    "LangChain",
    "LlamaIndex",
    "Postgres",
    "Qdrant",
    "Docker",
  ],
  excited_about: [
    "Smaller specialized models with strong UX",
    "Faster iteration loops from better evals",
    "Structured outputs in production pipelines",
    "Lightweight multimodal assistants",
  ],
  skeptical_about: [
    "Benchmark overfitting",
    "Unclear ROI from autonomous agents",
    "Vendor lock-in risk",
    "Hype around unverified productivity claims",
  ],
  top_links: [
    { title: "How Teams Are Shipping Reliable Agents", url: "https://news.ycombinator.com/" },
    { title: "Inference Economics in 2026", url: "https://news.ycombinator.com/" },
    { title: "Designing Better Eval Suites", url: "https://news.ycombinator.com/" },
    { title: "What Production RAG Still Gets Wrong", url: "https://news.ycombinator.com/" },
  ],
  best_rabbit_holes: [
    { title: "Stateful Agent Memory Tradeoffs", url: "https://news.ycombinator.com/" },
    { title: "Open Source Inference Stack Comparison", url: "https://news.ycombinator.com/" },
    { title: "Latency Budgets for AI UX", url: "https://news.ycombinator.com/" },
  ],
};

// ── DOM refs ──────────────────────────────────────────────
const pulse        = document.getElementById("vc-pulse");
const statusTitle  = document.getElementById("vc-status-title");
const statusDetail = document.getElementById("vc-status-detail");
const statusBadge  = document.getElementById("vc-status-badge");
const apiOrigin    = document.getElementById("vc-api-origin");

apiOrigin.textContent = API_BASE;

// ── Helpers ───────────────────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function timeAgo(isoStr) {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 2)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function setLoading(el) {
  el.className = "widget-loading";
  el.textContent = "Loading…";
}

function setError(el, msg) {
  el.className = "widget-error";
  el.textContent = `⚠ ${msg}`;
}

function normalizePercent(score) {
  if (score == null || score === "") return null;
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  const pct = n <= 1 ? n * 100 : n;
  return Math.round(Math.min(100, Math.max(0, pct)));
}

function tagList(items, limit = 8) {
  if (!Array.isArray(items) || !items.length) return "";
  return `<div class="tag-list">${items.slice(0, limit).map(t => {
    let label;
    if (typeof t === "string") {
      label = t;
    } else if (t && typeof t === "object") {
      // Try every common field name, then fall back to first string value found
      label = t.name ?? t.label ?? t.title ?? t.topic ?? t.theme ?? t.text ?? t.value ?? t.tool;
      if (!label) {
        label = Object.values(t).find(v => typeof v === "string" && v.length > 0);
      }
      label = label ?? JSON.stringify(t);
    } else {
      label = String(t);
    }
    return `<span class="tag">${label}</span>`;
  }).join("")}</div>`;
}

// ── Health check ──────────────────────────────────────────
async function checkHealth() {
  try {
    const data = await apiFetch("/api/v1/health");
    statusTitle.textContent  = "Backend online";
    statusDetail.textContent = data?.detail ?? "All systems nominal";
    statusBadge.className    = "status-badge online";
    statusBadge.textContent  = "Online";
  } catch {
    statusTitle.textContent  = "Backend unreachable";
    statusDetail.textContent = `Could not reach ${API_BASE} — update API_BASE in vibe-check.js`;
    statusBadge.className    = "status-badge offline";
    statusBadge.textContent  = "Offline";
    pulse.classList.add("offline");
  }
}

/** Widget 1: AI summary + meta stats row */
function renderSummary(el, metaEl, d) {
  const summary = d.ai_summary ?? "";
  const created = d.created_at ?? d.generated_at ?? "";
  const kind    = d.kind ?? "";
  const isExample = Boolean(d.__example);

  // Meta stats bar
  if (metaEl) {
    const stats = [
      d.item_count    != null ? { label: "stories",  val: d.item_count }              : null,
      d.llm_provider          ? { label: "provider", val: d.llm_provider }            : null,
      d.run_origin            ? { label: "origin",   val: d.run_origin }              : null,
      isExample ? { label: "mode", val: "example" } : null,
    ].filter(Boolean);

    metaEl.innerHTML = stats.map(s =>
      `<div class="meta-stat"><span class="meta-stat-val">${s.val}</span><span class="meta-stat-label">${s.label}</span></div>`
    ).join("");
  }

  const kindBadge = kind    ? `<span class="digest-source-badge">${kind}</span>`          : "";
  const timeBadge = created ? `<span class="digest-source-badge">${timeAgo(created)}</span>` : "";
  const staleBadge = isExample ? `<span class="digest-source-badge digest-source-badge--warn">Outdated sample data</span>` : "";
  const exampleNote = isExample
    ? `<p class="widget-example-note">API is offline. When the API is running, it will display live data like this. This is outdated example data shown for demonstration only.</p>`
    : "";

  const summaryHtml = summary
    ? `<div class="digest-summary">${summary}</div>`
    : `<div class="digest-summary empty-note">No AI summary generated for this snapshot yet.</div>`;

  el.className = "";
  el.innerHTML = `
    <div class="badge-row">${kindBadge}${timeBadge}${staleBadge}</div>
    ${exampleNote}
    ${summaryHtml}
  `;
}

/** Widget 2: top_links[] — ranked clickable story titles */
function renderTopLinks(el, d) {
  const links = d.top_links ?? [];
  if (!links.length) { setError(el, "No top links in this snapshot."); return; }
  el.className = "";
  el.innerHTML = `<ol class="link-list">${links.slice(0, 8).map(l => {
    const title = l.title ?? l.name ?? l.url ?? "Untitled";
    const url   = l.url ?? l.link ?? null;
    const inner = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>` : title;
    return `<li class="link-item">${inner}</li>`;
  }).join("")}</ol>`;
}

/** Widget 3: excited_about[] */
function renderExcited(el, d) {
  const items = d.excited_about ?? [];
  if (!items.length) { setError(el, "No excitement signals yet."); return; }
  el.className = "";
  el.innerHTML = tagList(items, 12);
}

/** Widget 4: skeptical_about[] */
function renderSkeptical(el, d) {
  const items = d.skeptical_about ?? [];
  if (!items.length) { setError(el, "No skepticism signals yet."); return; }
  el.className = "";
  el.innerHTML = tagList(items, 12);
}

/** Widget 5: most_mentioned_tools[] */
function renderTools(el, d) {
  const items = d.most_mentioned_tools ?? [];
  if (!items.length) { setError(el, "No tool signals yet."); return; }
  el.className = "";
  el.innerHTML = tagList(items, 14);
}

/** Widget 6: today_themes[] */
function renderThemes(el, d) {
  const items = d.today_themes ?? [];
  if (!items.length) { setError(el, "No themes yet."); return; }
  el.className = "";
  el.innerHTML = tagList(items, 12);
}

/** Widget 7: best_rabbit_holes[] */
function renderRabbitHoles(el, d) {
  const links = d.best_rabbit_holes ?? [];
  if (!links.length) { setError(el, "No rabbit holes yet."); return; }
  el.className = "";
  el.innerHTML = `<ol class="link-list">${links.slice(0, 6).map(l => {
    const title = l.title ?? l.name ?? l.url ?? "Untitled";
    const url   = l.url ?? l.link ?? null;
    const inner = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>` : title;
    return `<li class="link-item">${inner}</li>`;
  }).join("")}</ol>`;
}

// ── Main digest loader ────────────────────────────────────
async function loadDigest() {
  const els = {
    summary:  document.getElementById("vc-summary-content"),
    meta:     document.getElementById("vc-meta-stats"),
    links:    document.getElementById("vc-links-content"),
    excited:  document.getElementById("vc-excited-content"),
    skeptical:document.getElementById("vc-skeptical-content"),
    tools:    document.getElementById("vc-tools-content"),
    themes:   document.getElementById("vc-themes-content"),
    rabbit:   document.getElementById("vc-rabbit-content"),
  };

  try {
    const data = await apiFetch("/api/v1/digest/latest?source=hackernews");
    try {
      localStorage.setItem(LAST_DIGEST_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage failures; UI can still render live data.
    }

    renderSummary(els.summary, els.meta, data);
    renderTopLinks(els.links,    data);
    renderExcited(els.excited,   data);
    renderSkeptical(els.skeptical, data);
    renderTools(els.tools,       data);
    renderThemes(els.themes,     data);
    renderRabbitHoles(els.rabbit, data);
  } catch (err) {
    let cachedData = null;
    try {
      const raw = localStorage.getItem(LAST_DIGEST_KEY);
      if (raw) cachedData = JSON.parse(raw);
    } catch {
      cachedData = null;
    }

    const fallbackData = cachedData
      ? { ...cachedData, __example: true }
      : { ...EXAMPLE_DIGEST, __example: true };

    statusTitle.textContent  = "Backend offline - showing example snapshot";
    statusDetail.textContent = "API is offline. When the API is running, it will display live data like this. This is outdated example data shown for demonstration only.";
    statusBadge.className    = "status-badge offline";
    statusBadge.textContent  = "Example Data";
    pulse.classList.add("offline");

    renderSummary(els.summary, els.meta, fallbackData);
    renderTopLinks(els.links, fallbackData);
    renderExcited(els.excited, fallbackData);
    renderSkeptical(els.skeptical, fallbackData);
    renderTools(els.tools, fallbackData);
    renderThemes(els.themes, fallbackData);
    renderRabbitHoles(els.rabbit, fallbackData);
  }
}

// ── Boot ──────────────────────────────────────────────────
checkHealth();
loadDigest();

