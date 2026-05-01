/**
 * Integration test: parse the source index.html and assert the structural
 * invariants the rest of the app depends on.
 *
 * This runs against the *source* file (not dist/) so it doesn't require a
 * build step. The deploy workflow runs an additional dist/ verification.
 *
 * Head-metadata assertions use regex (happy-dom's HTML parser drops
 * meta tags after our CSP block due to its quote handling). Body/section
 * assertions use the DOM since structural queries are clearer that way.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

let html;
let doc;

beforeAll(async () => {
  html = await readFile(resolve(ROOT, "index.html"), "utf8");
  // happy-dom's parser tries to "load" linked stylesheets, scripts, iframes,
  // and images when the markup is inserted into a Document, producing
  // ECONNREFUSED noise even with disable flags. Strip every resource-fetching
  // tag — we only need the DOM for body structure (sections, anchors,
  // mini-player). Resource references are asserted via regex against `html`.
  const stripped = html
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/?\s*>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<iframe\b[^>]*\/?\s*>/gi, "")
    .replace(/<img\b[^>]*>/gi, "");
  doc = new DOMParser().parseFromString(stripped, "text/html");
});

describe("index.html — head metadata", () => {
  it("declares a Content Security Policy with default-src 'self'", () => {
    expect(html).toMatch(
      /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*default-src 'self'/i
    );
  });

  it("has an inline SVG favicon (no extra request)", () => {
    expect(html).toMatch(/<link\s+rel="icon"\s+href="data:image\/svg\+xml/i);
  });

  it("has Open Graph and Twitter card metadata", () => {
    expect(html).toMatch(/<meta\s+property="og:title"/i);
    expect(html).toMatch(/<meta\s+property="og:description"/i);
    expect(html).toMatch(/<meta\s+name="twitter:card"\s+content="summary/i);
  });

  it("has a page description for SEO", () => {
    const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    expect(m, "no description meta tag").not.toBeNull();
    expect(m[1].length).toBeGreaterThan(20);
  });

  it("declares a referrer policy", () => {
    expect(html).toMatch(/<meta\s+name="referrer"\s+content="strict-origin/i);
  });
});

describe("index.html — required sections", () => {
  const requiredSections = [
    "section-home",
    "section-vibe",
    "section-costars",
    "section-agent",
    "section-apk",
    "section-vibecheck",
    "section-portfolio",
  ];

  for (const id of requiredSections) {
    it(`contains #${id}`, () => {
      expect(doc.getElementById(id), `Missing required section #${id}`).not.toBeNull();
    });
  }
});

describe("index.html — GitHub repository links", () => {
  const requiredRepos = [
    "jeremybrachle/portfolio",
    "jeremybrachle/vibe-machine",
    "jeremybrachle/vibe-check-front-end",
    "jeremybrachle/vibe-check",
    "jeremybrachle/multi-agent",
    "jeremybrachle/apk-archaeologist",
    "jeremybrachle/co-stars-frontend",
    "jeremybrachle/co-stars-backend",
  ];

  for (const repo of requiredRepos) {
    it(`links to ${repo}`, () => {
      const link = doc.querySelector(`a[href*="github.com/${repo}"]`);
      expect(link, `No anchor links to github.com/${repo}`).not.toBeNull();
    });
  }

  it("uses rel=noopener (or noreferrer) on every external github link", () => {
    const links = doc.querySelectorAll('a[href*="github.com/jeremybrachle/"]');
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) {
      const rel = (a.getAttribute("rel") || "").toLowerCase();
      expect(rel, `${a.getAttribute("href")} missing rel=noopener`).toMatch(/noopener/);
    }
  });

  it("opens external github links in a new tab", () => {
    const links = doc.querySelectorAll('a[href*="github.com/jeremybrachle/"].github-link');
    for (const a of links) {
      expect(a.getAttribute("target")).toBe("_blank");
    }
  });
});

describe("index.html — mini-player", () => {
  it("contains the persistent vibe-machine iframe wrapper and iframe", () => {
    // iframes are stripped from `doc` to avoid happy-dom load attempts; check the raw HTML.
    expect(doc.getElementById("vm-iframe-wrap")).not.toBeNull();
    expect(html).toMatch(/<iframe[^>]*\bid="vm-iframe"/);
  });

  it("contains the mini-player with prev/play/next/minimize controls", () => {
    expect(doc.getElementById("mini-player")).not.toBeNull();
    expect(doc.getElementById("mp-play")).not.toBeNull();
    expect(doc.getElementById("mp-prev")).not.toBeNull();
    expect(doc.getElementById("mp-next")).not.toBeNull();
    expect(doc.getElementById("mp-minimize")).not.toBeNull();
  });
});

describe("index.html — script + style references", () => {
  it("loads player.js, main.js, and vibe-check.js from /js/", () => {
    expect(html).toMatch(/<script\s+src="\/js\/player\.js"/);
    expect(html).toMatch(/<script\s+[^>]*src="\/js\/main\.js"/);
    expect(html).toMatch(/<script\s+[^>]*src="\/js\/vibe-check\.js"/);
  });

  it("loads the global stylesheet first", () => {
    const links = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(
      (m) => m[1]
    );
    expect(links[0]).toBe("/css/global.css");
  });
});
