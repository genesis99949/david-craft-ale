/* One scroll controller for every page. Native links retain their hash,
   focus, scroll-margin and history behavior; Lenis smooths wheel input. */
(() => {
  'use strict';
  if (window.DCBScroll) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lenis = null;
  let active = true;

  const syncLock = () => {
    if (!lenis) return;
    const locked = ['hidden', 'clip'].includes(getComputedStyle(document.body).overflowY);
    if (locked) lenis.stop();
    else lenis.start();
  };

  const destroy = () => {
    lenis?.destroy();
    lenis = null;
  };

  const setup = () => {
    if (!active || reduced.matches || !window.Lenis) {
      destroy();
      return;
    }
    if (lenis) return;
    lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      autoRaf: true,
      // Dialogs keep their own native scrolling while the page is locked.
      prevent: element => element?.matches?.('[role="dialog"]') === true
    });
    syncLock();
  };

  window.DCBScroll = {
    scrollTo(target, options = {}) {
      const element = typeof target === 'string' ? document.querySelector(target) : target;
      if (element == null) return;
      const offset = options.offset ?? -(element instanceof Element
        ? parseFloat(getComputedStyle(element).scrollMarginTop) || 0 : 0);
      if (lenis) {
        lenis.scrollTo(element, { ...options, offset });
      } else {
        const top = typeof element === 'number' ? element : element.getBoundingClientRect().top + scrollY;
        window.scrollTo({ top: top + offset, behavior: reduced.matches ? 'instant' : 'smooth' });
      }
    }
  };

  // Existing menu/cart/search/quick-view code owns the body lock.
  new MutationObserver(syncLock).observe(document.body, {
    attributes: true, attributeFilter: ['style', 'class']
  });
  reduced.addEventListener('change', setup);

  // Cancel wheel momentum before native anchor navigation or a page-specific
  // anchor handler, otherwise a pending Lenis frame can undo the browser jump.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.href.includes('#')) {
      lenis?.reset();
    }
  }, true);
  const reset = () => lenis?.reset();
  addEventListener('hashchange', reset);
  addEventListener('popstate', reset);
  addEventListener('pagehide', () => { active = false; destroy(); });
  addEventListener('pageshow', () => {
    active = true;
    setup();
    // Read the browser-restored position; never force scroll to the top.
    lenis?.resize();
  });
  setup();
})();
