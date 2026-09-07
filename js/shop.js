/* ============================================================
   SHOP — shared cart + header search for every page.
   ------------------------------------------------------------
   Auto-wires itself onto whatever header a page already has, by
   aria-label, so no page markup needs editing:
       [aria-label="Search"]  -> opens the search panel
       [aria-label^="Cart"]   -> opens the cart drawer
   Any element carrying data-search-open / data-cart-open works too.

   Cart contents live in localStorage, so the cart is the same cart
   on every page. Adding a product anywhere updates every badge.

   Public API (used by products.html's add-to-cart buttons):
       DCB.cart.add(item)   item: {slug,name,price,currency,package,image}
       DCB.cart.open() / .close() / .count() / .items()
       DCB.search.open() / .close()
   ============================================================ */
(() => {
  'use strict';

  const KEY = 'dcb-cart';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- state ---------------- */
  let items = [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      items = parsed.filter(i => i && typeof i.slug === 'string' && Number.isFinite(+i.price));
    }
  } catch (e) { items = []; }          /* private mode, or someone else's data */

  const persist = () => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* non-fatal */ }
  };

  /* ---------------- search index ---------------- */
  const INDEX = [
    ['Blonde Ale', 'Light and crisp, the easy one', 'beer.html?brew=blonde', 'Beer'],
    ['Amber Pale Ale', 'Toasty and balanced', 'beer.html?brew=amber', 'Beer'],
    ['IPA', 'Bold, hop-forward and loud', 'beer.html?brew=ipa', 'Beer'],
    ['Dark Lager', 'Smooth, roasted and deep', 'beer.html?brew=dark', 'Beer'],
    ['Full Product Lineup', 'Bottles, cans, six-packs and merch', 'products.html', 'Shop'],
    ['Hopper Plushie', 'The winged mascot, in soft form', 'hopper.html', 'Shop'],
    ['Our Story', 'How David Craft Ale started', 'story.html', 'About'],
    ['Become an Affiliate', 'Partner with the brewery', 'affiliate.html', 'About'],
    ['Home', 'Back to the beginning', 'index.html#top', 'Site'],
    ['Account', 'Your details', 'account.html', 'Site'],
    ['Terms and Conditions', 'The legal bit', 'terms.html', 'Legal'],
    ['Cookies and Privacy', 'What we store, and what we do not', 'privacy.html', 'Legal']
  ].map(([title, blurb, href, group]) => ({ title, blurb, href, group }));

  /* ---------------- markup ---------------- */
  const root = document.createElement('div');
  root.className = 'dcb-shop';
  root.innerHTML = `
    <div class="shop-backdrop" data-shop-backdrop aria-hidden="true"></div>

    <aside class="cart-drawer" id="dcb-cart-drawer" role="dialog" aria-modal="true"
           aria-labelledby="dcb-cart-title" aria-hidden="true">
      <div class="cart-drawer-head">
        <h2 class="cart-drawer-title" id="dcb-cart-title">Your Cart</h2>
        <button class="cart-remove" type="button" data-cart-close aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-items" data-cart-list aria-live="polite"></div>
      <div class="cart-drawer-foot">
        <div class="cart-total"><span>Total</span><strong data-cart-total>0.00 USD</strong></div>
        <button class="cart-checkout" type="button" data-cart-checkout>Checkout <span aria-hidden="true">&rarr;</span></button>
        <p class="cart-note">Product pricing &middot; Shipping calculated at checkout</p>
      </div>
    </aside>

    <div class="search-panel" id="dcb-search" role="dialog" aria-modal="true"
         aria-label="Search David Craft Ale" aria-hidden="true">
      <div class="search-shell">
        <div class="search-row">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>
          <input class="search-input" type="search" data-search-input autocomplete="off"
                 placeholder="Find a beer&hellip;" aria-label="Search the site" aria-controls="dcb-search-results">
          <button class="search-close" type="button" data-search-close aria-label="Close search">&times;</button>
        </div>
        <p class="search-meta" data-search-meta></p>
        <ul class="search-results" id="dcb-search-results" data-search-results aria-live="polite"></ul>
      </div>
    </div>`;
  document.body.appendChild(root);

  const backdrop = root.querySelector('[data-shop-backdrop]');
  const drawer   = root.querySelector('.cart-drawer');
  const list     = root.querySelector('[data-cart-list]');
  const totalEl  = root.querySelector('[data-cart-total]');
  const panel    = root.querySelector('.search-panel');
  const input    = root.querySelector('[data-search-input]');
  const results  = root.querySelector('[data-search-results]');
  const meta     = root.querySelector('[data-search-meta]');

  let returnFocus = null;

  /* Never leave focus stranded inside a container we just set aria-hidden on.
     returnFocus is whatever had focus when the overlay opened, which is <body>
     when the "/" shortcut was used — body is not focusable, so blur instead. */
  function restoreFocus(box) {
    const active = document.activeElement;
    if (returnFocus && returnFocus !== document.body
        && document.contains(returnFocus) && typeof returnFocus.focus === 'function') {
      returnFocus.focus();
    }
    if (box.contains(document.activeElement)) document.activeElement.blur();
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /* ---------------- cart rendering ---------------- */
  const count = () => items.reduce((n, i) => n + i.quantity, 0);

  function paintBadges() {
    const n = count();
    document.querySelectorAll('[data-cart-open], [aria-label^="Cart"]').forEach(btn => {
      btn.classList.add('cart-button');
      let badge = btn.querySelector('.cart-count');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-count';
        badge.setAttribute('aria-hidden', 'true');
        btn.appendChild(badge);
      }
      const changed = badge.textContent !== String(n);
      badge.textContent = n;
      badge.classList.toggle('has-items', n > 0);
      if (changed && n > 0 && !reduced()) {
        badge.classList.remove('is-bumping');
        void badge.offsetWidth;               /* restart the animation */
        badge.classList.add('is-bumping');
      }
      btn.setAttribute('aria-label', n ? `Cart, ${n} ${n === 1 ? 'item' : 'items'}` : 'Cart, empty');
    });
  }

  function renderCart() {
    if (!items.length) {
      list.innerHTML = `<div class="cart-empty"><strong>Nothing here yet</strong>Add a product from the lineup and it will show up here.</div>`;
    } else {
      list.innerHTML = items.map((item, i) => `
        <article class="cart-item">
          <div class="cart-item-photo"><img src="${esc(item.image)}" alt="" loading="lazy"></div>
          <div>
            <h3 class="cart-item-name">${esc(item.name)}</h3>
            <span class="cart-item-package">${esc(item.package)}</span>
            <div class="cart-item-quantity" role="group" aria-label="Quantity for ${esc(item.name)}">
              <button class="cart-quantity-button" type="button" data-qty="down" data-i="${i}" aria-label="Decrease quantity of ${esc(item.name)}">&minus;</button>
              <span class="cart-quantity-value" aria-live="polite">${item.quantity}</span>
              <button class="cart-quantity-button" type="button" data-qty="up" data-i="${i}" aria-label="Increase quantity of ${esc(item.name)}">+</button>
            </div>
            <p class="cart-item-price">${(item.price * item.quantity).toFixed(2)} ${esc(item.currency || 'USD')}</p>
          </div>
          <button class="cart-remove" type="button" data-remove="${i}" aria-label="Remove ${esc(item.name)} from cart">&times;</button>
        </article>`).join('');
    }
    totalEl.textContent = `${items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} USD`;
  }

  function sync() { persist(); paintBadges(); renderCart(); }

  /* ---------------- open / close ---------------- */
  const anyOpen = () => drawer.classList.contains('is-open') || panel.classList.contains('is-open');

  function lockScroll() { document.body.style.overflow = anyOpen() ? 'hidden' : ''; }

  function openCart() {
    closeSearch(true);
    returnFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('is-open');
    lockScroll();
    setTimeout(() => drawer.querySelector('[data-cart-close]')?.focus(), reduced() ? 0 : 300);
  }
  function closeCart(silent) {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (!anyOpen()) backdrop.classList.remove('is-open');
    lockScroll();
    if (!silent) restoreFocus(drawer);
  }

  function openSearch() {
    closeCart(true);
    returnFocus = document.activeElement;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('is-open');
    lockScroll();
    render('');
    setTimeout(() => input.focus(), reduced() ? 0 : 220);
  }
  function closeSearch(silent) {
    if (!panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    if (!anyOpen()) backdrop.classList.remove('is-open');
    lockScroll();
    input.value = '';
    if (!silent) restoreFocus(panel);
  }

  /* ---------------- search ---------------- */
  const hl = (text, q) => {
    if (!q) return esc(text);
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  };

  function render(query) {
    const q = query.trim().toLowerCase();
    const hits = q
      ? INDEX.filter(e => (e.title + ' ' + e.blurb + ' ' + e.group).toLowerCase().includes(q))
      : INDEX;
    meta.textContent = q
      ? `${hits.length} ${hits.length === 1 ? 'result' : 'results'} for "${query.trim()}"`
      : 'Everything on the site';
    if (!hits.length) {
      results.innerHTML = `<li style="--i:0"><div class="search-empty"><b>Nothing found</b>Try a beer name, "Hopper", or "story".</div></li>`;
      return;
    }
    results.innerHTML = hits.map((e, i) => `
      <li style="--i:${i}">
        <a class="search-hit" href="${esc(e.href)}">
          <strong>${hl(e.title, q)}</strong>
          <span>${hl(e.blurb, q)}</span>
        </a>
      </li>`).join('');
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', (e) => {
    /* a synthetic event can target document itself, which has no closest() */
    if (!(e.target instanceof Element)) return;
    const s = e.target.closest('[data-search-open], [aria-label="Search"]');
    if (s) { e.preventDefault(); openSearch(); return; }

    const c = e.target.closest('[data-cart-open], [aria-label^="Cart"]');
    if (c) { e.preventDefault(); openCart(); return; }

    if (e.target.closest('[data-cart-close]')) { closeCart(); return; }
    if (e.target.closest('[data-search-close]')) { closeSearch(); return; }
    if (e.target.closest('[data-shop-backdrop]')) { closeCart(); closeSearch(); return; }
  }, true);

  list.addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]');
    if (q) {
      const i = +q.dataset.i, item = items[i];
      if (!item) return;
      if (q.dataset.qty === 'up') item.quantity += 1;
      else if (item.quantity > 1) item.quantity -= 1;
      else items.splice(i, 1);
      sync();
      (list.querySelector(`[data-i="${Math.min(i, items.length - 1)}"][data-qty="${q.dataset.qty}"]`)
        || drawer.querySelector('[data-cart-close]')).focus();
      return;
    }
    const r = e.target.closest('[data-remove]');
    if (!r) return;
    items.splice(+r.dataset.remove, 1);
    sync();
    (list.querySelector('[data-remove]') || drawer.querySelector('[data-cart-close]')).focus();
  });

  root.querySelector('[data-cart-checkout]').addEventListener('click', () => {
    if (typeof window.showToast === 'function') window.showToast('Checkout opens with the bottle shop.');
  });

  input.addEventListener('input', () => render(input.value));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCart(); closeSearch(); return; }
    /* "/" is the search shortcut, unless the user is already typing */
    if (e.key === '/' && !anyOpen() && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)
        && !document.activeElement.isContentEditable) {
      e.preventDefault(); openSearch(); return;
    }
    if (e.key !== 'Tab') return;
    const box = drawer.classList.contains('is-open') ? drawer
              : panel.classList.contains('is-open') ? panel : null;
    if (!box) return;
    const f = [...box.querySelectorAll('a[href],button,input,select,textarea')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* another tab changed the cart — keep this one honest */
  addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    try { const v = JSON.parse(e.newValue || '[]'); if (Array.isArray(v)) { items = v; paintBadges(); renderCart(); } }
    catch (err) { /* ignore malformed */ }
  });

  /* ---------------- public API ---------------- */
  window.DCB = window.DCB || {};
  window.DCB.cart = {
    add(item) {
      if (!item || !item.slug) return;
      const found = items.find(i => i.slug === item.slug);
      if (found) {
        found.quantity += 1;
        found.name = item.name || found.name;
        found.price = Number.parseFloat(item.price) || found.price;
        found.package = item.package || found.package;
        found.image = item.image || found.image;
      }
      else items.push({
        slug: item.slug,
        name: item.name || 'Product',
        price: Number.parseFloat(item.price) || 2.49,
        currency: item.currency || 'USD',
        package: item.package || 'Product',
        image: item.image || '',
        quantity: 1
      });
      sync();
    },
    open: openCart, close: () => closeCart(), count, items: () => items.slice()
  };
  window.DCB.search = { open: openSearch, close: () => closeSearch() };

  sync();
  /* the old header linked to products.html?cart=open; keep that working */
  if (new URLSearchParams(location.search).get('cart') === 'open') {
    requestAnimationFrame(openCart);
  }
})();
