/* ═══════════════════════════════════════════════
   Vibe Machine — Configuration (Portfolio Demo)
   ═══════════════════════════════════════════════ */

window.VIBE_CONFIG = {

  // ── Branding ──
  title: 'Vibe Machine',
  subtitle: '',
  idleText: 'Click play to start vibing',
  vibeButtonLabel: '⟐ VIBE MODE',

  // ── Audio ──
  trackFormats: ['.ogg', '.mp3', '.wav', '.flac', '.m4a', '.aac', '.webm'],
  defaultVolume: 0.7,
  autoPlay: false,
  shuffleByDefault: false,

  // ── Analyser ──
  fftSize: 2048,
  smoothing: 0.82,

  // ── Visualizers ──
  visualizers: ['blank', 'bars', 'waveform', 'circular', 'starrynight'],
  defaultVisualizer: 8,

  // ── Theme Colors ──
  theme: {
    accent:      '#00c878',
    accentRGB:   '0, 200, 120',
    secondary:   '#b060ff',
    secondaryRGB: '176, 96, 255',
    bg:          '#000000',
    textPrimary: '#ffffff',
    textSecondary: '#999999',
    textDim:     '#666666',
  },

  // ── Vibe Mode ──
  vibeMouseTimeout: 2500,

  // ── Drop Zone ──
  dropZoneEnabled: false,

  // ── Transitions ──
  transitionEnabled: true,
  transitionDuration: 5,
  sunArcDefault: 'off',
  lofiGridEnabled: false,
  ampBarsEnabled: false,
  mouseFxEnabled: true,
};
