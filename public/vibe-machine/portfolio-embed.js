/**
 * portfolio-embed.js — Bridge between Vibe Machine iframe and portfolio shell.
 *
 * Loaded AFTER app.js inside the demo copy. When running inside an iframe:
 *   1. Auto-dismisses the demo start screen (keeps visualizer visible)
 *   2. Broadcasts player state + frequency data to the parent via postMessage
 *   3. Listens for play/pause/seek commands from the parent mini-player
 */
(function () {
  'use strict';
  if (window.self === window.top) return; // only active when embedded

  // ── 1. Dismiss the demo start screen ──────────────────────────
  var demoStart = document.getElementById('demo-start');
  if (demoStart) {
    demoStart.style.display = 'none';
    // The demo-start code in app.js hid these; re-show them
    ['ui-overlay', 'queue-panel', 'vibe-toggle', 'transition-controls', 'info-btn-wrap']
      .forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = '';
      });
  }

  // ── 2. Wait for __vibeAPI to exist (app.js IIFE already ran) ──
  var api = window.__vibeAPI;
  if (!api) return;

  // ── 3. Broadcast state to parent (~20 fps) ────────────────────
  // Pin the parent origin once so we never broadcast to a navigated/
  // hostile parent later in the lifecycle.
  var parentOrigin = window.location.origin;

  // When the parent reports the player is minimized + paused, throttle
  // the EQ broadcast to 1 Hz to save CPU. Parent re-enables instantly.
  var freqIdle = false;

  setInterval(function () {
    var s = api.getState();
    window.parent.postMessage({
      type: 'vm-state',
      playing:     s.playing,
      trackName:   s.trackName,
      category:    s.category,
      currentTime: s.currentTime,
      duration:    s.duration
    }, parentOrigin);
  }, 50);

  // ── 4. Broadcast frequency data for mini-EQ (~30 fps) ─────────
  var lastFreq = 0;
  setInterval(function () {
    if (freqIdle && performance.now() - lastFreq < 1000) return;
    var d = api.getFreqData();
    if (d) {
      window.parent.postMessage({ type: 'vm-freq', data: d }, parentOrigin);
      lastFreq = performance.now();
    }
  }, 33);

  // ── 5. Receive commands from parent ────────────────────────────
  window.addEventListener('message', function (e) {
    // Only accept commands from our owning parent window + same origin.
    if (e.source !== window.parent) return;
    if (e.origin !== parentOrigin) return;
    if (!e.data || typeof e.data !== 'object' || e.data.type !== 'vm-cmd') return;
    var cmd = typeof e.data.cmd === 'string' ? e.data.cmd : '';
    switch (cmd) {
      case 'toggle': api.toggle(); break;
      case 'play':   api.play();   break;
      case 'pause':  api.pause();  break;
      case 'next':   if (api.next) api.next(); break;
      case 'prev':   if (api.prev) api.prev(); break;
      case 'seek': {
        var v = Number(e.data.value);
        if (Number.isFinite(v) && v >= 0 && v <= 100) api.seek(v);
        break;
      }
      case 'idle':
        freqIdle = !!e.data.value;
        break;
      case 'startVibe':
        api.play();
        // Enter vibe mode instantly
        var btn = document.getElementById('vibe-toggle');
        if (btn) btn.click();
        break;
    }
  });

  // ── 6. Tell parent iframe is ready ─────────────────────────────
  window.parent.postMessage({ type: 'vm-ready' }, parentOrigin);

  // ── 7. Auto-hide UI after 2s of inactivity (embed only) ───────
  var uiEls = ['ui-overlay', 'queue-panel', 'vibe-toggle', 'transition-controls', 'info-btn-wrap'];
  var idleTimer = null;
  var uiHidden = false;

  function hideUI() {
    uiHidden = true;
    uiEls.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
    });
    document.body.style.cursor = 'none';
  }

  function showUI() {
    uiHidden = false;
    uiEls.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.style.opacity = ''; el.style.pointerEvents = ''; }
    });
    document.body.style.cursor = '';
  }

  function resetIdleTimer() {
    if (uiHidden) showUI();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(hideUI, 2000);
  }

  // Add transitions for smooth fade
  uiEls.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.transition = (el.style.transition ? el.style.transition + ', ' : '') + 'opacity 0.4s ease';
  });

  document.addEventListener('mousemove', resetIdleTimer);
  document.addEventListener('mousedown', resetIdleTimer);
  document.addEventListener('keydown', resetIdleTimer);
  resetIdleTimer();
})();
