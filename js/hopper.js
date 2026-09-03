/* js/hopper.js
   Extras din hopper.html. Comportament neschimbat: fisierul e incarcat
   in exact aceeasi pozitie in document ca blocul inline de dinainte. */
/* Add-to-cart for this page. Reads the same data attributes products.html
   uses and hands the item to the shared cart in shop.js. */
document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;

  const buy = e.target.closest('[data-buy-hopper]');
  if (buy) {
    window.DCB?.cart.add({
      slug: 'hopper-plushie',
      name: 'Hopper Plushie',
      price: '29.99',
      currency: 'USD',
      package: 'Limited plushie',
      image: 'assets/Plushie_nobg.png'
    });
    window.DCB?.cart.open();
    return;
  }

  const add = e.target.closest('[data-add]');
  if (!add) return;
  const card = add.closest('[data-product-slug]');
  if (!card) return;
  window.DCB?.cart.add({
    slug: card.dataset.productSlug,
    name: card.querySelector('h3').textContent.trim(),
    price: card.dataset.productPrice,
    currency: 'USD',
    package: card.dataset.productPackage,
    image: card.querySelector('img').getAttribute('src')
  });
  const label = add.firstChild;
  if (label && label.nodeType === Node.TEXT_NODE) {
    label.textContent = 'Added ';
    setTimeout(() => { label.textContent = 'Add to cart '; }, 1200);
  }
});

/* The shared header is injected by site-chrome.js and takes vertical
   space; feed its height to the hero so section 1 fills exactly one screen. */
(() => {
  const setChrome = () => {
    const h = ['.site-header', '.site-announce']
      .reduce((n, s) => n + (document.querySelector(s)?.offsetHeight || 0), 0);
    document.documentElement.style.setProperty('--chrome-h', h + 'px');
  };
  addEventListener('DOMContentLoaded', setChrome);
  addEventListener('resize', setChrome);
  setChrome();
})();

/* Hero gallery — matches the reference's arrows + dots. */
(() => {
  const gal = document.getElementById('gallery');
  if (!gal) return;
  const slides = [...gal.querySelectorAll('figure')];
  const dots = document.querySelector('.hp-dots');
  let i = 0;

  slides.forEach((_, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Show image ${n + 1} of ${slides.length}`);
    b.addEventListener('click', () => show(n));
    dots.appendChild(b);
  });

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((f, k) => {
      f.toggleAttribute('data-active', k === i);
      f.setAttribute('aria-hidden', String(k !== i));
    });
    [...dots.children].forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
  }

  document.querySelectorAll('[data-gal]').forEach(btn =>
    btn.addEventListener('click', () => show(i + (btn.dataset.gal === 'next' ? 1 : -1))));

  gal.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    show(i + (e.key === 'ArrowRight' ? 1 : -1));
  });
  let touchStart = null;
  gal.addEventListener('touchstart', e => {
    touchStart = e.touches.length === 1 ? {x:e.touches[0].clientX, y:e.touches[0].clientY} : null;
  }, {passive:true});
  gal.addEventListener('touchend', e => {
    if (!touchStart || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) show(i + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive:true});
  gal.addEventListener('touchcancel', () => { touchStart = null; }, {passive:true});

  show(0);
})();
