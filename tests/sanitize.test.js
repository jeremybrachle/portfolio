import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  safeUrl,
  safeInt,
  isValidHnId,
  clampStr,
  fmtDuration,
} from "../public/js/lib/sanitize.js";

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert('xss' & "boom")</script>`)).toBe(
      "&lt;script&gt;alert(&#39;xss&#39; &amp; &quot;boom&quot;)&lt;/script&gt;"
    );
  });

  it("returns empty string for null/undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("coerces non-strings to string before escaping", () => {
    expect(escapeHtml(42)).toBe("42");
    expect(escapeHtml(true)).toBe("true");
  });

  it("preserves safe characters untouched", () => {
    expect(escapeHtml("Hello, World — 2026!")).toBe("Hello, World — 2026!");
  });
});

describe("safeUrl", () => {
  it("accepts http and https URLs", () => {
    expect(safeUrl("http://example.com/")).toBe("http://example.com/");
    expect(safeUrl("https://example.com/path?q=1")).toBe("https://example.com/path?q=1");
  });

  it("rejects javascript: URLs", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("#");
    expect(safeUrl("JAVASCRIPT:alert(1)")).toBe("#");
    expect(safeUrl("  javascript:alert(1)  ")).toBe("#");
  });

  it("rejects data: and vbscript: URLs", () => {
    expect(safeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(safeUrl("vbscript:msgbox(1)")).toBe("#");
  });

  it("rejects file:, ftp:, and other non-http schemes", () => {
    expect(safeUrl("file:///etc/passwd")).toBe("#");
    expect(safeUrl("ftp://example.com/")).toBe("#");
  });

  it("rejects non-string input", () => {
    expect(safeUrl(null)).toBe("#");
    expect(safeUrl(undefined)).toBe("#");
    expect(safeUrl(42)).toBe("#");
    expect(safeUrl({ href: "https://example.com/" })).toBe("#");
  });

  it("rejects empty and whitespace-only strings", () => {
    expect(safeUrl("")).toBe("#");
    expect(safeUrl("   ")).toBe("#");
  });

  it("rejects URLs longer than 2048 characters", () => {
    const huge = "https://example.com/" + "a".repeat(2050);
    expect(safeUrl(huge)).toBe("#");
  });

  it("rejects malformed URLs", () => {
    expect(safeUrl("not a url")).toBe("#");
    expect(safeUrl("://broken")).toBe("#");
  });
});

describe("safeInt", () => {
  it("returns the floor of a finite positive number", () => {
    expect(safeInt(42)).toBe(42);
    expect(safeInt(42.9)).toBe(42);
    expect(safeInt("17")).toBe(17);
  });

  it("returns 0 for negative, NaN, Infinity, or non-numeric input", () => {
    expect(safeInt(-5)).toBe(0);
    expect(safeInt(NaN)).toBe(0);
    expect(safeInt(Infinity)).toBe(0);
    expect(safeInt("xyz")).toBe(0);
    expect(safeInt(null)).toBe(0);
    expect(safeInt(undefined)).toBe(0);
  });

  it("clamps values above the default max (1_000_000)", () => {
    expect(safeInt(9_999_999)).toBe(1_000_000);
  });

  it("respects a custom max", () => {
    expect(safeInt(500, 100)).toBe(100);
    expect(safeInt(50, 100)).toBe(50);
  });
});

describe("isValidHnId", () => {
  it("accepts plain positive integers", () => {
    expect(isValidHnId(1)).toBe(true);
    expect(isValidHnId(42_000_000)).toBe(true);
  });

  it("rejects zero, negatives, floats, and non-numbers", () => {
    expect(isValidHnId(0)).toBe(false);
    expect(isValidHnId(-1)).toBe(false);
    expect(isValidHnId(1.5)).toBe(false);
    expect(isValidHnId("42")).toBe(false);
    expect(isValidHnId(null)).toBe(false);
    expect(isValidHnId(undefined)).toBe(false);
    expect(isValidHnId(NaN)).toBe(false);
  });

  it("rejects absurdly large values (>= 1e12)", () => {
    expect(isValidHnId(1e12)).toBe(false);
    expect(isValidHnId(1e15)).toBe(false);
  });
});

describe("clampStr", () => {
  it("returns short strings unchanged", () => {
    expect(clampStr("hello")).toBe("hello");
  });

  it("truncates with ellipsis when over the limit", () => {
    const s = "a".repeat(400);
    const out = clampStr(s);
    expect(out.length).toBe(301); // 300 + "…"
    expect(out.endsWith("…")).toBe(true);
  });

  it("respects a custom max", () => {
    expect(clampStr("abcdef", 3)).toBe("abc…");
  });

  it("coerces null/undefined to empty string", () => {
    expect(clampStr(null)).toBe("");
    expect(clampStr(undefined)).toBe("");
  });
});

describe("fmtDuration", () => {
  it("formats seconds as M:SS", () => {
    expect(fmtDuration(0)).toBe("0:00");
    expect(fmtDuration(7)).toBe("0:07");
    expect(fmtDuration(65)).toBe("1:05");
    expect(fmtDuration(3599)).toBe("59:59");
    expect(fmtDuration(3600)).toBe("60:00");
  });

  it("returns 0:00 for non-finite or negative input", () => {
    expect(fmtDuration(NaN)).toBe("0:00");
    expect(fmtDuration(Infinity)).toBe("0:00");
    expect(fmtDuration(-5)).toBe("0:00");
  });

  it("floors fractional seconds", () => {
    expect(fmtDuration(7.9)).toBe("0:07");
  });
});
