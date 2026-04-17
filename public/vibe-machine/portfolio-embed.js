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
  setInterval(function () {
    var s = api.getState();
    window.parent.postMessage({
      type: 'vm-state',
      playing:     s.playing,
      trackName:   s.trackName,
      category:    s.category,
      currentTime: s.currentTime,
      duration:    s.duration
    }, '*');
  }, 50);

  // ── 4. Broadcast frequency data for mini-EQ (~30 fps) ─────────
  setInterval(function () {
    var d = api.getFreqData();
    if (d) window.parent.postMessage({ type: 'vm-freq', data: d }, '*');
  }, 33);

  // ── 5. Receive commands from parent ────────────────────────────
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'vm-cmd') return;
    switch (e.data.cmd) {
      case 'toggle': api.toggle(); break;
      case 'play':   api.play();   break;
      case 'pause':  api.pause();  break;
      case 'seek':   api.seek(e.data.value); break;
      case 'startVibe':
        api.play();
        // Enter vibe mode instantly
        var btn = document.getElementById('vibe-toggle');
        if (btn) btn.click();
        break;
    }
  });

  // ── 6. Tell parent iframe is ready ─────────────────────────────
  window.parent.postMessage({ type: 'vm-ready' }, '*');

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
