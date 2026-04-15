/**
 * home.js — Home page animations
 * - Fake visualizer bars (placeholder until real Vibe Machine is dropped in)
 * - Audio play button wiring for Claire de Lune
 */

// ── Generate fake visualizer bars ──
function initVisualizerBars() {
  const container = document.getElementById('vizBars');
  if (!container) return;

  const barCount = 48;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'viz-bar';

    // Randomize animation timing for organic feel
    const minH = 5 + Math.random() * 15;
    const maxH = 30 + Math.random() * 70;
    const duration = 0.6 + Math.random() * 1.4;
    const delay = Math.random() * 2;

    bar.style.setProperty('--min-h', `${minH}%`);
    bar.style.setProperty('--max-h', `${maxH}%`);
    bar.style.setProperty('--duration', `${duration}s`);
    bar.style.animationDelay = `${delay}s`;

    container.appendChild(bar);
  }
}

// ── Audio player ──
function initAudioPlayer() {
  const audio = document.getElementById('bgAudio');
  const playBtn = document.getElementById('playBtn');
  const statusEl = document.getElementById('audioStatus');

  if (!audio || !playBtn) return;

  let isPlaying = false;

  // Check if audio file exists
  audio.addEventListener('canplaythrough', () => {
    if (statusEl) {
      statusEl.textContent = 'Ready — Debussy, Clair de Lune (Public Domain)';
    }
  });

  audio.addEventListener('error', () => {
    if (statusEl) {
      statusEl.innerHTML = 'Drop a PD recording at <code>/public/audio/clair-de-lune.mp3</code>';
    }
  });

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      playBtn.textContent = '▶';
      isPlaying = false;
    } else {
      audio.play().then(() => {
        playBtn.textContent = '⏸';
        isPlaying = true;
      }).catch(() => {
        // Autoplay blocked or file missing — that's fine
        if (statusEl) {
          statusEl.innerHTML = 'Audio not loaded — place MP3 at <code>/public/audio/clair-de-lune.mp3</code>';
        }
      });
    }
  });

  // Try autoplay on page load (browsers may block this, which is fine)
  audio.play().then(() => {
    playBtn.textContent = '⏸';
    isPlaying = true;
  }).catch(() => {
    // Autoplay blocked — user can click play
  });
}

// ── Init ──
initVisualizerBars();
initAudioPlayer();
