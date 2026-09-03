/* ============================================================
   THE POUR — layered rising page transition (runtime)
   ------------------------------------------------------------
   Outgoing page : four bands rise from below, staggered, honey
                   first and cocoa last. When cocoa lands the
                   screen is covered and navigation happens.
   Incoming page : paints already covered (see the <head> guard),
                   bubbles rise through the cocoa for whatever is
                   left of --pour-hold after the real load time,
                   then the stack unwinds upward.

   The hold absorbs load latency rather than adding to it: a page
   that took 200ms to arrive holds for 300ms, not 500ms, so the
   door-to-door feel stays constant instead of stacking.

   Note on the reveal order: it is the mirror of the cover, not a
   repeat of it. Cocoa sits on top of the stack, so if it left
   last the reveal would be a plain cocoa panel sliding up with
   the three colours hidden behind it. Leaving top-first unwinds
   the stack — cocoa, then ipa, then amber, then honey — so the
   palette reads on the way out as well as on the way in.
   ============================================================ */
(() => {
  'use strict';

  const D = document.documentElement;
  const KEY = 'dcb-pour';
  const N = 4;
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.3 7.2L21 4.6l-4.4 6 7.4 1.4-7.4 1.4 4.4 6-6.7-2.6L12 24l-2.3-7.2L3 19.4l4.4-6L0 12l7.4-1.4-4.4-6 6.7 2.6z"/></svg>';

  /* left%, diameter px, rise multiplier, delay fraction */
  const BUBBLES = [
    [14, 17, 1.05, .00], [31, 25, .78, .18], [47, 12, 1.25, .07],
    [59, 29, .70, .30], [71, 19, .95, .12], [83, 21, .60, .40],
    [26, 10, 1.35, .24]
  ];

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Bail out cleanly where we can't animate — plain navigation is
     a perfectly good outcome. */
  if (typeof Element.prototype.animate !== 'function') {
    D.removeAttribute('data-pour');
    return;
  }

  /* ---- tuned values, read back off :root ---- */
  const cs = getComputedStyle(D);
  const ms = (name, fallback) => {
    const v = cs.getPropertyValue(name).trim();
    if (!v) return fallback;
    if (v.endsWith('ms')) return parseFloat(v);
    if (v.endsWith('s')) return parseFloat(v) * 1000;
    return fallback;
  };
  const COVER   = ms('--pour-cover', 800);
  const HOLD    = ms('--pour-hold', 500);
  const REVEAL  = ms('--pour-reveal', 300);
  const STAGGER = ms('--pour-stagger', 55);
  const EASE    = cs.getPropertyValue('--pour-ease').trim() || 'cubic-bezier(.645,.045,.355,1)';

  /* ---- overlay ---- */
  const veil = document.createElement('div');
  veil.className = 'pour';
  veil.setAttribute('aria-hidden', 'true');
  veil.innerHTML =
    Array.from({ length: N }, (_, i) => `<div class="pour__layer pour__layer--${i + 1}"></div>`).join('') +
    `<div class="pour__bubbles">${BUBBLES.map(([x, d]) =>
      `<span class="pour__bub" style="left:${x}%;width:${d}px;height:${d}px"></span>`).join('')}</div>` +
    `<div class="pour__mark">${STAR}</div>`;
  document.body.appendChild(veil);

  const layers  = [...veil.querySelectorAll('.pour__layer')];
  const bubbles = veil.querySelector('.pour__bubbles');
  const bubEls  = [...veil.querySelectorAll('.pour__bub')];
  const mark    = veil.querySelector('.pour__mark');
  const moving  = [veil, ...layers, bubbles, ...bubEls, mark];

  let busy = false;

  /* A finished fill animation keeps applying its end value, and
     animations outrank inline styles — so state must be released by
     cancelling, not by clearing properties. Without this the
     transition works exactly once per page load. */
  const release = () => {
    moving.forEach(el => el.getAnimations().forEach(a => a.cancel()));
    layers.forEach(el => el.style.removeProperty('transform'));
    bubbles.style.removeProperty('opacity');
    mark.style.removeProperty('opacity');
  };

  /* ---------- leaving ---------- */
  function cover(href) {
    busy = true;
    release();
    veil.classList.add('is-on');

    let last = null;
    layers.forEach((el, i) => {
      last = el.animate(
        [{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }],
        { duration: COVER, delay: i * STAGGER, easing: EASE, fill: 'both' }
      );
    });

    /* the logomark arrives with the last band */
    mark.animate(
      [{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }],
      { duration: COVER + (N - 1) * STAGGER, easing: 'linear', fill: 'both' }
    );

    const leave = () => {
      try {
        sessionStorage.setItem(KEY, '1');
      } catch (e) { /* private mode — the page still navigates */ }
      location.href = href;
    };

    /* the deepest band is delayed longest, so it settles last */
    last.finished.then(leave, leave);
  }

  /* ---------- arriving ---------- */
  function reveal() {
    release();
    veil.classList.add('is-on');
    layers.forEach(el => { el.style.transform = 'translateY(0%)'; });
    mark.style.opacity = '1';

    /* hand off from the pre-paint ::before to the real overlay in
       the same frame, so there is no gap to flash through */
    D.removeAttribute('data-pour');

    const wait = Math.max(80, HOLD - performance.now());
    const span = wait + REVEAL + (N - 1) * STAGGER;

    /* bubbles rise for the whole covered stretch */
    bubbles.animate(
      [{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .7 }, { opacity: 0 }],
      { duration: span, easing: 'linear', fill: 'both' }
    );
    bubEls.forEach((b, j) => {
      const [, , speed, delay] = BUBBLES[j];
      b.animate(
        [{ transform: 'translateY(0px) scale(.6)' }, { transform: `translateY(${-Math.round(innerHeight * 1.15 * speed)}px) scale(1)` }],
        { duration: span * (1 - delay), delay: span * delay, easing: 'cubic-bezier(.35,.6,.5,1)', fill: 'both' }
      );
    });

    setTimeout(() => {
      mark.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: Math.max(120, REVEAL * .6), easing: 'linear', fill: 'both' });

      let last = null;
      layers.forEach((el, i) => {
        el.style.removeProperty('transform');
        last = el.animate(
          [{ transform: 'translateY(0%)' }, { transform: 'translateY(-100%)' }],
          /* mirrored order: the top band leaves first (see header note) */
          { duration: REVEAL, delay: (N - 1 - i) * STAGGER, easing: EASE, fill: 'both' }
        );
      });

      const done = () => {
        veil.classList.remove('is-on');
        release();
        busy = false;
      };
      /* honey is delayed longest on the way out, so it clears last */
      layers[0].getAnimations()[0].finished.then(done, done);
    }, wait);
  }

  /* ---------- link interception ---------- */
  document.addEventListener('click', (e) => {
    if (busy) { e.preventDefault(); return; }
    if (reduced()) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const a = e.target.closest('a[href]');
    if (!a) return;
    if (a.hasAttribute('download')) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('data-no-pour')) return;
    /* the header search and cart open overlays in place; they are not
       navigations, and pour.js registers its capture listener first */
    if (a.matches('[data-search-open],[data-cart-open],[aria-label="Search"],[aria-label^="Cart"]')) return;

    let url;
    try { url = new URL(a.getAttribute('href'), location.href); }
    catch (err) { return; }

    if (url.origin !== location.origin) return;
    if (url.href === location.href) return;

    /* in-page anchors keep scrolling — a wipe for a jump to #top
       would be motion with nothing behind it */
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;

    e.preventDefault();
    cover(url.href);
  }, true);

  /* Restored from bfcache: no transition is in flight, so make sure
     nothing is left covering the page. */
  addEventListener('pageshow', (ev) => {
    if (!ev.persisted) return;
    busy = false;
    veil.classList.remove('is-on');
    release();
    D.removeAttribute('data-pour');
  });

  /* ---------- run the reveal if we arrived through a pour ---------- */
  if (window.__pour && !reduced()) {
    busy = true;
    reveal();
  } else {
    D.removeAttribute('data-pour');
  }
})();
