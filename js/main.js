/**
 * main.js — Shared logic across all portfolio pages
 * Handles nav active state highlighting.
 */

// Highlight correct nav link based on current URL
function initNav() {
  const path = window.location.pathname;
  const links = document.querySelectorAll('.nav-dock a');

  links.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');

    if (path === '/' && href === '/') {
      link.classList.add('active');
    } else if (href !== '/' && path.includes(href)) {
      link.classList.add('active');
    }
  });
}

initNav();
