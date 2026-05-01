/**
 * Vibe Check — Static demo (no backend required)
 *
 * Two data sources:
 *   1. Top HN stories — pulled live from Hacker News' public Firebase API.
 *      Same source the full Vibe Check backend uses internally. CORS-enabled,
 *      no key needed. Works directly from the browser.
 *
 *   2. Top LLMs — manually curated leaderboard. There's no equivalent
 *      browser-friendly public API for model rankings, so this is a static
 *      list updated by hand. The full Vibe Check backend tracks this
 *      automatically; this page just shows a snapshot.
 */

const HN_API   = "https://hacker-news.firebaseio.com/v0";
const HN_LIMIT = 10;

const LLM_RANKINGS_UPDATED = "April 2026";
const LLM_RANKINGS = {
  cloud: [
    { rank: 1, name: "GPT-5",         vendor: "OpenAI",     note: "Strongest general reasoning + tool use" },
    { rank: 2, name: "Claude 4.5",    vendor: "Anthropic",  note: "Top coding + long-context performance" },
    { rank: 3, name: "Gemini 2.5 Pro",vendor: "Google",     note: "Multimodal + 2M token context window" },
    { rank: 4, name: "Grok 4",        vendor: "xAI",        note: "Fast iteration, strong real-time reasoning" },
    { rank: 5, name: "DeepSeek V3.5", vendor: "DeepSeek",   note: "Cheapest frontier-tier API" },
  ],
  local: [
    { rank: 1, name: "Llama 4 70B",   vendor: "Meta",       note: "Best open-weight all-rounder" },
    { rank: 2, name: "Qwen 3 72B",    vendor: "Alibaba",    note: "Top open multilingual + reasoning" },
    { rank: 3, name: "Mistral Large 3", vendor: "Mistral",  note: "European, Apache 2.0 friendly" },
    { rank: 4, name: "Gemma 3 27B",   vendor: "Google",     note: "Best small-footprint quality" },
    { rank: 5, name: "Phi-4",         vendor: "Microsoft",  note: "Punches above its weight at 14B" },
  ],
};

// ── DOM refs ──────────────────────────────────────────────
const elStories    = document.getElementById("vc-stories-content");
const elLlmCloud   = document.getElementById("vc-llm-cloud-content");
const elLlmLocal   = document.getElementById("vc-llm-local-content");
const elLlmUpdated = document.getElementById("vc-llm-updated");

// ── Helpers ───────────────────────────────────────────────
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Allow only http(s) URLs. Anything else (javascript:, data:, vbscript:, blank,
// or non-string) becomes "#" so we can never produce a script-executing href
// from untrusted Hacker News data.
function safeUrl(u) {
  if (typeof u !== "string") return "#";
  const trimmed = u.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return "#";
  let parsed;
  try { parsed = new URL(trimmed); } catch (_e) { return "#"; }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "#";
  return parsed.toString();
}

// Bound an untrusted numeric value to a safe non-negative integer.
function safeInt(n, max = 1_000_000) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.min(Math.floor(v), max);
}

// HN item IDs must be plain positive integers.
function isValidHnId(id) {
  return Number.isInteger(id) && id > 0 && id < 1e12;
}

// Cap any user-controlled string before rendering so a hostile field
// can't blow up the DOM or trigger pathological layout work.
function clampStr(s, max = 300) {
  const str = String(s ?? "");
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function setError(el, msg) {
  el.className = "widget-error";
  el.textContent = `⚠ ${msg}`;
}

async function fetchJson(url, signal) {
  const res = await fetch(url, {
    signal,
    credentials: "omit",
    referrerPolicy: "no-referrer",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ── Top HN stories (live) ─────────────────────────────────
async function loadTopStories() {
  const ctrl = AbortSignal.timeout(8000);
  try {
    const idsRaw = await fetchJson(`${HN_API}/topstories.json`, ctrl);
    if (!Array.isArray(idsRaw)) {
      setError(elStories, "Unexpected response from Hacker News.");
      return;
    }
    // Validate every id before building any URL with it.
    const ids = idsRaw.filter(isValidHnId).slice(0, HN_LIMIT);
    if (ids.length === 0) {
      setError(elStories, "No valid stories returned from Hacker News.");
      return;
    }

    const items = await Promise.all(
      ids.map((id) =>
        fetchJson(`${HN_API}/item/${encodeURIComponent(id)}.json`, ctrl).catch(() => null)
      )
    );

    // Reject anything that doesn't look like a real HN story object.
    const valid = items.filter(
      (s) => s && typeof s === "object" && isValidHnId(s.id)
    );
    if (!valid.length) {
      setError(elStories, "No stories returned from Hacker News.");
      return;
    }

    elStories.className = "";
    elStories.innerHTML = `
      <ol class="link-list">
        ${valid.map((s) => {
          const title    = escapeHtml(clampStr(s.title || "Untitled", 300));
          const safeHref = safeUrl(s.url) !== "#"
            ? safeUrl(s.url)
            : `https://news.ycombinator.com/item?id=${encodeURIComponent(s.id)}`;
          const score    = safeInt(s.score);
          const comments = safeInt(s.descendants);
          return `
            <li class="link-item">
              <a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer nofollow ugc">${title}</a>
              <div class="link-meta">
                <span class="meta-chip">▲ ${score}</span>
                <span class="meta-chip">💬 ${comments}</span>
              </div>
            </li>
          `;
        }).join("")}
      </ol>
    `;
  } catch (err) {
    // Don't echo raw error text into the DOM — could include URL or response
    // fragments under some failure modes. Use a fixed, escaped message.
    const reason = err && err.name === "TimeoutError" ? "request timed out" : "network error";
    setError(elStories, `Could not reach Hacker News (${reason}).`);
  }
}

// ── Top LLMs (static curated list) ─────────────────────────
function renderLlmList(el, models) {
  el.className = "";
  el.innerHTML = `
    <ol class="llm-list">
      ${models.map((m) => `
        <li class="llm-row">
          <span class="llm-rank">#${m.rank}</span>
          <div class="llm-body">
            <div class="llm-name">${escapeHtml(m.name)} <span class="llm-vendor">${escapeHtml(m.vendor)}</span></div>
            <div class="llm-note">${escapeHtml(m.note)}</div>
          </div>
        </li>
      `).join("")}
    </ol>
  `;
}

function loadLlmRankings() {
  if (elLlmUpdated) elLlmUpdated.textContent = LLM_RANKINGS_UPDATED;
  if (elLlmCloud)   renderLlmList(elLlmCloud, LLM_RANKINGS.cloud);
  if (elLlmLocal)   renderLlmList(elLlmLocal, LLM_RANKINGS.local);
}

// ── Init ──────────────────────────────────────────────────
loadTopStories();
loadLlmRankings();
