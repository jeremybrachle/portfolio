/**
 * home.js — Home page animations
 * - Fake visualizer bars (placeholder until real Vibe Machine is dropped in)
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

// ── Init ──
initVisualizerBars();
