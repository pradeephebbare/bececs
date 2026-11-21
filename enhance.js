/* Interactive layer: toasts, connection status, live search, copy-to-clipboard,
   image fade-in and link prefetch. No external libraries, no inline code. */
(() => {
  'use strict';

  // ---------- toast ----------
  let toastHost = null;
  function toast(message, kind = 'info', ms = 3200) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.className = 'toast-host';
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      document.body.append(toastHost);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${kind}`;
    el.textContent = message;                    // textContent: never parsed as HTML
    toastHost.append(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, ms);
  }

  // ---------- back to top (replaces inline onclick) ----------
  const backTop = document.getElementById('backTop');
  if (backTop) backTop.addEventListener('click', () => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  });

  // ---------- online / offline ----------
  window.addEventListener('offline', () => toast('You\u2019re offline. Some content may not load.', 'warn', 5000));
  window.addEventListener('online', () => toast('Back online.', 'ok'));

  // ---------- copy e-mail ----------
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied ${text}`, 'ok');
    } catch (_) {
      toast('Copy isn\u2019t available here - please select the address manually.', 'warn');
    }
  });

  // ---------- live search for cards ----------
  function initSearch(input) {
    const grid = document.querySelector(input.dataset.searchTarget);
    if (!grid) return;
    const items = Array.from(grid.children);
    const status = document.getElementById(input.dataset.searchStatus || '');
    const empty = document.getElementById(input.dataset.searchEmpty || '');
    const index = items.map(el => el.textContent.toLowerCase().replace(/\s+/g, ' '));
    let timer = 0;
    const run = () => {
      const q = input.value.trim().toLowerCase();
      const terms = q.split(' ').filter(Boolean);
      let shown = 0;
      items.forEach((el, i) => {
        const match = terms.every(t => index[i].includes(t));
        el.hidden = !match;
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
      if (status) status.textContent = q ? `${shown} of ${items.length} shown` : `${items.length} total`;
    };
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 80); });
    input.addEventListener('keydown', e => { if (e.key === 'Escape' && input.value) { input.value = ''; run(); } });
    run();
  }
  document.querySelectorAll('[data-search-target]').forEach(initSearch);

  // ---------- images fade in when loaded ----------
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete && img.naturalWidth) { img.classList.add('img-loaded'); return; }
    img.addEventListener('load', () => img.classList.add('img-loaded'), { once: true });
    img.addEventListener('error', () => img.classList.add('img-loaded'), { once: true });
  });

  // ---------- prefetch pages on hover/touch (makes navigation feel instant) ----------
  const prefetched = new Set();
  const conn = navigator.connection;
  const frugal = conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));
  function prefetch(a) {
    if (frugal || !a || a.origin !== location.origin || a.pathname === location.pathname) return;
    if (!/\.html?$|\/$/.test(a.pathname) || prefetched.has(a.href)) return;
    prefetched.add(a.href);
    const l = document.createElement('link');
    l.rel = 'prefetch'; l.href = a.href;
    document.head.append(l);
  }
  ['mouseover', 'touchstart'].forEach(type =>
    document.addEventListener(type, e => prefetch(e.target.closest && e.target.closest('a[href]')), { passive: true }));

  // ---------- keep the page's anchor target clear of the sticky header ----------
  if (location.hash) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) setTimeout(() => t.scrollIntoView({ block: 'start' }), 50);
  }
})();
