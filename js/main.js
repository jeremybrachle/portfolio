/**
 * main.js — Single-page section switcher.
 *
 * All pages live as <section class="page-section"> in index.html.
 * Navigation toggles which section is visible, swaps body class for theming,
 * and updates the background element — zero page loads, zero content fetching.
 * The Vibe Machine iframe never leaves the DOM.
 */

var currentSection = 'section-home';

// ── Section map for URL paths (for bookmarkable deep links) ───
var sectionPaths = {
  'section-home':      '/',
  'section-vibe':      '/vibe-machine',
  'section-costars':   '/costars',
  'section-agent':     '/multi-agent',
  'section-apk':       '/apk-archeologist',
  'section-portfolio': '/portfolio'
};
var pathToSection = {};
Object.keys(sectionPaths).forEach(function(k) { pathToSection[sectionPaths[k]] = k; });

// ── Switch to a section by ID ─────────────────────────────────
function showSection(id, pushState) {
  if (pushState === undefined) pushState = true;
  var target = document.getElementById(id);
  if (!target) return;

  // Hide current
  var prev = document.querySelector('.page-section.active');
  if (prev) prev.classList.remove('active');

  // Show target
  target.classList.add('active');

  // Swap body class for theme
  document.body.className = target.dataset.bodyClass || '';

  // Swap background
  var bg = document.querySelector('.page-bg');
  if (bg) bg.className = 'page-bg ' + (target.dataset.bgClass || '');

  // Update title
  document.title = target.dataset.title || "Jeremy Brachle — Portfolio";

  // Update URL
  var path = sectionPaths[id] || '/';
  if (pushState) history.pushState({ section: id }, document.title, path);

  // Update nav active state
  updateNav(id);

  // Scroll to top
  window.scrollTo(0, 0);

  // Mount/unmount visualizer
  var isHome = (id === 'section-home');
  if (isHome && window.__vizMount) window.__vizMount();
  if (!isHome && window.__vizUnmount) window.__vizUnmount();

  currentSection = id;
}

// ── Nav active state ──────────────────────────────────────────
function updateNav(sectionId) {
  document.querySelectorAll('.nav-dock a').forEach(function(link) {
    link.classList.toggle('active', link.dataset.nav === sectionId);
  });
}

// ── Handle clicks on anything with data-nav ───────────────────
document.addEventListener('click', function(e) {
  var navEl = e.target.closest('[data-nav]');
  if (!navEl) return;
  e.preventDefault();
  var target = navEl.dataset.nav;
  if (target && target !== currentSection) {
    showSection(target);
  }
});

// ── Handle back / forward ─────────────────────────────────────
window.addEventListener('popstate', function(e) {
  var id = (e.state && e.state.section) || pathToSection[location.pathname] || 'section-home';
  showSection(id, false);
});

// ── Initial setup ─────────────────────────────────────────────
(function() {
  // Determine starting section from URL path
  var startSection = pathToSection[location.pathname] || 'section-home';
  showSection(startSection, false);
  history.replaceState({ section: startSection }, document.title);
})();
