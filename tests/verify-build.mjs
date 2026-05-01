#!/usr/bin/env node
/**
 * Post-build verification — runs in CI after `npm run build`.
 *
 * Asserts that the bundled dist/ output contains every critical surface:
 * required files, all SPA sections, every GitHub link, and the persistent
 * iframe + mini-player markup. A regression that drops any of these will
 * fail the deploy before a single byte hits S3.
 *
 * Exit codes:
 *   0  all checks passed
 *   1  one or more checks failed (details printed to stderr)
 */
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");

const failures = [];
const passes = [];

function check(label, ok, detail = "") {
  if (ok) {
    passes.push(label);
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // 1. Required files / directories
  const requiredPaths = [
    "index.html",
    "js/player.js",
    "js/main.js",
    "js/vibe-check.js",
    "js/lib/sanitize.js",
    "vibe-machine/index.html",
    "vibe-machine/app.js",
    "vibe-machine/portfolio-embed.js",
    "vibe-machine/visualizers/circular.js",
  ];
  for (const rel of requiredPaths) {
    const ok = await exists(resolve(DIST, rel));
    check(`exists: ${rel}`, ok, "missing from dist/");
  }

  // 2. index.html content invariants
  const indexPath = resolve(DIST, "index.html");
  if (!(await exists(indexPath))) {
    failures.push("dist/index.html missing — cannot run content checks");
    return report();
  }
  const html = await readFile(indexPath, "utf8");

  const requiredSnippets = [
    ['CSP meta tag', /Content-Security-Policy/i],
    ['Inline favicon', /<link\s+rel="icon"\s+href="data:image\/svg\+xml/i],
    ['Open Graph title', /<meta\s+property="og:title"/i],
    ['Twitter card', /<meta\s+name="twitter:card"/i],
    ['Section: home', /id="section-home"/],
    ['Section: vibe machine', /id="section-vibe"/],
    ['Section: co-stars', /id="section-costars"/],
    ['Section: multi-agent', /id="section-agent"/],
    ['Section: apk archeologist', /id="section-apk"/],
    ['Section: vibe check', /id="section-vibecheck"/],
    ['Section: portfolio', /id="section-portfolio"/],
    ['Persistent iframe wrap', /id="vm-iframe-wrap"/],
    ['Mini-player root', /id="mini-player"/],
    ['Mini-player minimize button', /id="mp-minimize"/],
    ['GitHub link: portfolio', /github\.com\/jeremybrachle\/portfolio/],
    ['GitHub link: vibe-machine', /github\.com\/jeremybrachle\/vibe-machine/],
    ['GitHub link: vibe-check frontend', /github\.com\/jeremybrachle\/vibe-check-front-end/],
    ['GitHub link: vibe-check api', /github\.com\/jeremybrachle\/vibe-check[^-]/],
    ['GitHub link: multi-agent', /github\.com\/jeremybrachle\/multi-agent/],
    ['GitHub link: apk-archaeologist', /github\.com\/jeremybrachle\/apk-archaeologist/],
  ];
  for (const [label, re] of requiredSnippets) {
    check(label, re.test(html), `pattern not found in dist/index.html`);
  }

  // 3. Build hygiene
  check(
    "no REPLACE_ME / TODO leaked into dist/index.html",
    !/REPLACE_ME|REPLACE_ACCOUNT_ID/.test(html),
    "placeholder string survived into the build"
  );

  // 4. Hashed asset bundle exists
  const hasHashedJs = /assets\/index-[A-Za-z0-9_-]{6,}\.js/.test(html);
  const hasHashedCss = /assets\/index-[A-Za-z0-9_-]{6,}\.css/.test(html);
  check("hashed JS bundle referenced", hasHashedJs, "no /assets/index-*.js link in HTML");
  check("hashed CSS bundle referenced", hasHashedCss, "no /assets/index-*.css link in HTML");

  return report();
}

function report() {
  for (const p of passes) console.log(`  ✓ ${p}`);
  if (failures.length === 0) {
    console.log(`\n✅ Build verification passed (${passes.length} checks)`);
    process.exit(0);
  }
  console.error(`\n❌ Build verification failed — ${failures.length} of ${passes.length + failures.length} checks did not pass:`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

main().catch((err) => {
  console.error("verify-build crashed:", err);
  process.exit(2);
});
