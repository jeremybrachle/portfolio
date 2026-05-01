/**
 * Validates the postMessage origin/source check pattern used by player.js
 * and portfolio-embed.js. Regression test for the hardening that prevents
 * a navigated cross-origin document from injecting commands into the player.
 */
import { describe, it, expect } from "vitest";

/**
 * Mirror of the validation logic in public/js/player.js. Kept here as a pure
 * function so we can verify it without spinning up the whole player.
 */
function isValidVmMessage(event, expectedSource, expectedOrigin) {
  if (event.source !== expectedSource) return false;
  if (event.origin !== expectedOrigin) return false;
  if (!event.data || typeof event.data !== "object") return false;
  if (typeof event.data.type !== "string") return false;
  return true;
}

describe("postMessage validation", () => {
  const fakeIframe = { contentWindow: Symbol("iframe-window") };
  const ORIGIN = "https://portfolio.example";

  function evt(overrides = {}) {
    return {
      source: fakeIframe.contentWindow,
      origin: ORIGIN,
      data: { type: "vm-state", playing: true },
      ...overrides,
    };
  }

  it("accepts a well-formed message from the iframe at the expected origin", () => {
    expect(isValidVmMessage(evt(), fakeIframe.contentWindow, ORIGIN)).toBe(true);
  });

  it("rejects a message from a different window (e.g. opener tab)", () => {
    const e = evt({ source: Symbol("other-window") });
    expect(isValidVmMessage(e, fakeIframe.contentWindow, ORIGIN)).toBe(false);
  });

  it("rejects a message from a different origin", () => {
    const e = evt({ origin: "https://attacker.example" });
    expect(isValidVmMessage(e, fakeIframe.contentWindow, ORIGIN)).toBe(false);
  });

  it("rejects messages with non-object data", () => {
    expect(isValidVmMessage(evt({ data: "play" }), fakeIframe.contentWindow, ORIGIN)).toBe(false);
    expect(isValidVmMessage(evt({ data: null }), fakeIframe.contentWindow, ORIGIN)).toBe(false);
    expect(isValidVmMessage(evt({ data: 42 }), fakeIframe.contentWindow, ORIGIN)).toBe(false);
  });

  it("rejects messages without a string type field", () => {
    const e = evt({ data: { playing: true } });
    expect(isValidVmMessage(e, fakeIframe.contentWindow, ORIGIN)).toBe(false);
  });
});

/**
 * The iframe-side bridge clamps seek values into [0, 100]. Mirror that here.
 */
function clampSeekPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

describe("seek value clamping", () => {
  it("passes valid percentages through", () => {
    expect(clampSeekPct(0)).toBe(0);
    expect(clampSeekPct(50)).toBe(50);
    expect(clampSeekPct(100)).toBe(100);
  });

  it("clamps out-of-range values", () => {
    expect(clampSeekPct(-5)).toBe(0);
    expect(clampSeekPct(150)).toBe(100);
  });

  it("rejects non-finite input", () => {
    expect(clampSeekPct(NaN)).toBeNull();
    expect(clampSeekPct(Infinity)).toBeNull();
    expect(clampSeekPct("not a number")).toBeNull();
  });
});
