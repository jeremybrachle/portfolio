/**
 * sanitize.js — Pure helpers for sanitizing untrusted input before
 * rendering it into the DOM.
 *
 * Exported for both runtime use (vibe-check.js) and unit testing.
 * No DOM access, no side effects — safe to import in any environment.
 */

/** Escape characters with HTML meaning. Returns "" for null/undefined. */
export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Allow only http(s) URLs. Anything else (javascript:, data:, vbscript:,
 * non-string, blank, or absurdly long) becomes "#" so we never produce a
 * script-executing href from untrusted data.
 */
export function safeUrl(u) {
  if (typeof u !== "string") return "#";
  const trimmed = u.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return "#";
  let parsed;
  try { parsed = new URL(trimmed); } catch (_e) { return "#"; }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "#";
  return parsed.toString();
}

/** Bound an untrusted numeric value to a safe non-negative integer. */
export function safeInt(n, max = 1_000_000) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.min(Math.floor(v), max);
}

/** Hacker News item IDs must be plain positive integers under 1e12. */
export function isValidHnId(id) {
  return Number.isInteger(id) && id > 0 && id < 1e12;
}

/** Cap any user-controlled string before rendering. */
export function clampStr(s, max = 300) {
  const str = String(s ?? "");
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** Format a duration in seconds as "M:SS". Returns "0:00" for non-finite. */
export function fmtDuration(s) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}
