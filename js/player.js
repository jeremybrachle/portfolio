/**
 * player.js — Persistent Vibe Machine iframe + mini-player
 *
 * Embeds the real Vibe Machine demo in an iframe that lives outside
 * .page-content so the SPA router never destroys it.
 *
 * On the home page the iframe is mounted inside #visualizer (full view).
 * On every other page the iframe is hidden but audio keeps playing,
 * and a draggable mini-player shows track info + a tiny EQ visualizer.
 */

const STORAGE_KEY = 'portfolio-player';

function initPlayer() {
  /* ── elements ── */
  var el   = document.getElementById('mini-player');
  var iframe = document.getElementById('vm-iframe');
  if (!el || !iframe) return;

  var playBtn      = el.querySelector('#mp-play');
  var trackEl      = el.querySelector('#mp-track');
  var timeEl       = el.querySelector('#mp-time');
  var progressBar  = el.querySelector('#mp-progress-bar');
  var progressFill = el.querySelector('#mp-progress-fill');
  var handle       = el.querySelector('#mp-handle');
  var eqCanvas     = el.querySelector('#mp-eq');

  /* ── saved position ── */
  var saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) {}
  if (saved.pos && saved.pos.x != null) {
    el.style.left   = saved.pos.x + 'px';
    el.style.bottom = 'auto';
    el.style.top    = saved.pos.y + 'px';
  }

  /* ── state from iframe ── */
  var vmPlaying  = false;
  var vmTrack    = '';
  var vmTime     = 0;
  var vmDuration = 0;
  var vmFreq     = null;
  var vmReady    = false;

  function sendCmd(cmd, value) {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage({ type: 'vm-cmd', cmd: cmd, value: value }, '*');
  }

  /* ── message listener ── */
  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'vm-state') {
      vmPlaying  = e.data.playing;
      vmTrack    = e.data.trackName || '';
      vmTime     = e.data.currentTime || 0;
      vmDuration = e.data.duration || 0;
      updateMiniUI();
    } else if (e.data.type === 'vm-freq') {
      vmFreq = e.data.data;
    } else if (e.data.type === 'vm-ready') {
      vmReady = true;
    }
  });

  /* ── update mini player UI ── */
  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function updateMiniUI() {
    trackEl.textContent = vmTrack || 'Vibe Machine';
    timeEl.textContent  = fmt(vmTime) + ' / ' + fmt(vmDuration);
    if (vmDuration > 0) {
      progressFill.style.width = (vmTime / vmDuration * 100) + '%';
    }
    playBtn.textContent = vmPlaying ? '⏸' : '▶';
    el.classList.toggle('playing', vmPlaying);
  }

  /* ── mini player controls ── */
  playBtn.addEventListener('click', function () {
    sendCmd('toggle');
  });

  progressBar.addEventListener('click', function (e) {
    if (!vmDuration) return;
    var rect = progressBar.getBoundingClientRect();
    var pct = ((e.clientX - rect.left) / rect.width) * 100;
    sendCmd('seek', pct);
  });

  /* ── save / restore position ── */
  function save() {
    var pos = null;
    if (el.style.left) {
      pos = { x: parseInt(el.style.left, 10), y: parseInt(el.style.top, 10) };
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ pos: pos }));
  }
  window.addEventListener('beforeunload', save);
  setInterval(save, 5000);

  /* ── dragging ── */
  var dragging = false, dragOffX = 0, dragOffY = 0;

  handle.addEventListener('mousedown', startDrag);
  handle.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    el.classList.add('dragging');
    var rect = el.getBoundingClientRect();
    if (e.touches) { dragOffX = e.touches[0].clientX - rect.left; dragOffY = e.touches[0].clientY - rect.top; }
    else           { dragOffX = e.clientX - rect.left;             dragOffY = e.clientY - rect.top; }
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup',   endDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend',  endDrag);
  }
  function onDrag(e) {
    if (!dragging) return;
    e.preventDefault();
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    var x = Math.max(0, Math.min(window.innerWidth  - el.offsetWidth,  cx - dragOffX));
    var y = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, cy - dragOffY));
    el.style.left = x + 'px';  el.style.top = y + 'px';
    el.style.bottom = 'auto';  el.style.right = 'auto';
  }
  function endDrag() {
    dragging = false;
    el.classList.remove('dragging');
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup',   endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend',  endDrag);
    save();
  }

  /* ═══════════════════════════════════════════════════════════════
     MINI EQ — draws 8 bars from frequency data sent by the iframe
     ═══════════════════════════════════════════════════════════════ */
  var eqCtx = eqCanvas ? eqCanvas.getContext('2d') : null;

  function drawMiniEQ() {
    requestAnimationFrame(drawMiniEQ);
    if (!eqCtx || !eqCanvas) return;

    var ew = eqCanvas.width;
    var eh = eqCanvas.height;
    eqCtx.clearRect(0, 0, ew, eh);

    if (!vmFreq || !vmPlaying) return;

    var bars = Math.min(vmFreq.length, 5);
    var step = Math.max(1, Math.floor(vmFreq.length / bars));
    var bw   = 3;
    var gap  = 2;
    var totalW = bars * bw + (bars - 1) * gap;
    var ox = (ew - totalW) / 2;

    for (var j = 0; j < bars; j++) {
      var val = (vmFreq[j * step] || 0) / 255;
      var minH = 2;
      var bh = minH + val * (eh - minH - 1);
      eqCtx.fillStyle = '#c084fc';
      eqCtx.fillRect(ox + j * (bw + gap), eh - bh, bw, bh);
    }
  }
  drawMiniEQ();

  /* ═══════════════════════════════════════════════════════════════
     IFRAME MOUNT / UNMOUNT — controlled by the SPA router

     IMPORTANT: We NEVER move the iframe in the DOM (appendChild).
     Moving an iframe causes the browser to reload it, killing
     audio playback. Instead we keep it fixed in body and use
     CSS position:fixed to overlay it on top of #visualizer.
     ═══════════════════════════════════════════════════════════════ */
  var iframeWrap = document.getElementById('vm-iframe-wrap');
  var _rafId = null;

  function positionOverStage() {
    var stage = document.getElementById('visualizer');
    if (!stage || !iframeWrap) return;
    var r = stage.getBoundingClientRect();
    iframeWrap.style.position = 'fixed';
    iframeWrap.style.left   = r.left   + 'px';
    iframeWrap.style.top    = r.top    + 'px';
    iframeWrap.style.width  = r.width  + 'px';
    iframeWrap.style.height = r.height + 'px';
    _rafId = requestAnimationFrame(positionOverStage);
  }

  window.__vizMount = function () {
    if (!iframeWrap) return;
    iframeWrap.classList.add('mounted');
    iframeWrap.classList.remove('hidden');
    iframeWrap.style.pointerEvents = '';
    el.classList.add('mp-hidden');          // hide mini-player on home
    positionOverStage();                   // start tracking position
  };

  window.__vizUnmount = function () {
    if (!iframeWrap) return;
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    iframeWrap.classList.remove('mounted');
    iframeWrap.classList.add('hidden');
    iframeWrap.style.pointerEvents = 'none';
    el.classList.remove('mp-hidden');        // show mini-player on sub-pages
  };

  // Initial mount is handled by main.js showSection()
}

initPlayer();
