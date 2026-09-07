(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const forcePreview = params.get('offer') === '1';
  if (!forcePreview && sessionStorage.getItem('dcb-offer-dismissed') === '1') return;

  const beers = [
    { key:'blonde-bottle', name:'Blonde bottle', image:'assets/bottle-blonde.png', slug:'blonde-ale-bottle', cartName:'Blonde Ale Bottle', price:2.49, package:'330 ml bottle' },
    { key:'amber-can', name:'Amber can', image:'assets/can-amber.png', slug:'amber-pale-ale-can', cartName:'Amber Pale Ale Can', price:1.99, package:'330 ml can' },
    { key:'ipa-six', name:'IPA six-pack', image:'assets/sixpack-bottles-ipa.png', slug:'ipa-bottle-six-pack', cartName:'IPA Bottle Six-Pack', price:13.99, package:'6 × 330 ml bottles' },
    { key:'dark-six', name:'Dark can six-pack', image:'assets/clean-sixpack-cans-dark.png', slug:'dark-lager-can-six-pack', cartName:'Dark Lager Can Six-Pack', price:10.99, package:'6 × 330 ml cans' }
  ];

  const accessories = [
    { key:'plushie', name:'Hopper plushie', image:'assets/hopper-plushie-cut.png', slug:'hopper-plushie', cartName:'Hopper Plushie', price:29.99, package:'1 plushie' },
    { key:'mats', name:'Beer mats', image:'assets/clean-hopper-beer-mats.png', slug:'hopper-beer-mats', cartName:'Hopper Beer Mats', price:9.99, package:'Set of 4' },
    { key:'opener', name:'Bottle opener', image:'assets/clean-hopper-bottle-opener.png', slug:'hopper-bottle-opener', cartName:'Hopper Bottle Opener', price:6.99, package:'1 opener' },
    { key:'glass', name:'Pint glass', image:'assets/clean-hopper-pint-glass.png', slug:'hopper-pint-glass', cartName:'Hopper Pint Glass', price:8.99, package:'16 oz glass' }
  ];

  const discounts = [10,15,20,25,30,35,40].map(percent => ({
    key:`discount-${percent}`,
    name:`${percent}% off`,
    percent,
    image:''
  }));

  const categories = [beers, accessories, discounts];
  const categoryNames = ['Beer', 'Accessory', 'Discount'];

  const itemMarkup = (item, categoryIndex) => `
    <div class="dcb-offer-slot-item" data-item="${item.key}">
      ${categoryIndex === 2
        ? `<strong class="dcb-offer-percent">${item.percent}<small>%</small></strong>`
        : `<img src="${item.image}" alt="">`}
      <span>${item.name}</span>
    </div>`;

  const reelMarkup = (items, categoryIndex) => {
    const repeated = Array.from({length:4}, () => items).flat();
    return `
      <div class="dcb-offer-slot" data-category="${categoryIndex}" aria-label="${categoryNames[categoryIndex]}">
        <div class="dcb-offer-slot-track" aria-hidden="true">${repeated.map(item => itemMarkup(item, categoryIndex)).join('')}</div>
      </div>`;
  };

  const popup = document.createElement('aside');
  popup.className = 'dcb-offer';
  popup.hidden = true;
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'false');
  popup.setAttribute('aria-labelledby', 'dcb-offer-title');
  popup.innerHTML = `
    <button class="dcb-offer-close" type="button" aria-label="Close special offer">&times;</button>
    <p class="dcb-offer-kicker">Build a lucky bundle</p>
    <h2 class="dcb-offer-title" id="dcb-offer-title">Psst, what're you buyin'?</h2>
    <p class="dcb-offer-subtitle">Spin a beer, an accessory and your Hopper discount.</p>
    <div class="dcb-offer-slots" aria-label="Bundle slot machine">
      ${reelMarkup(beers,0)}
      <span class="dcb-offer-plus" aria-hidden="true">+</span>
      ${reelMarkup(accessories,1)}
      <span class="dcb-offer-plus" aria-hidden="true">+</span>
      ${reelMarkup(discounts,2)}
    </div>
    <p class="dcb-offer-result" role="status" aria-live="polite">Spin to build your bundle.</p>
    <div class="dcb-offer-actions">
      <button class="dcb-offer-spin" type="button">Spin the bundle <span aria-hidden="true">→</span></button>
      <button class="dcb-offer-add" type="button" hidden>Add to cart &amp; apply discount <span aria-hidden="true">→</span></button>
    </div>
    <span class="dcb-offer-spark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 1L14.2 9.8 23 12 14.2 14.2 12 23 9.8 14.2 1 12 9.8 9.8Z"/></svg></span>
    <img class="dcb-offer-mascot" src="assets/hopper-thumbs-up-cut.png" alt="" aria-hidden="true">
  `;
  document.body.appendChild(popup);

  const closeButton = popup.querySelector('.dcb-offer-close');
  const spinButton = popup.querySelector('.dcb-offer-spin');
  const addButton = popup.querySelector('.dcb-offer-add');
  const result = popup.querySelector('.dcb-offer-result');
  const slots = [...popup.querySelectorAll('.dcb-offer-slot')];
  let selection = null;
  let spinning = false;

  const open = () => {
    popup.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => popup.classList.add('is-visible')));
  };

  const close = () => {
    popup.classList.remove('is-visible');
    try { sessionStorage.setItem('dcb-offer-dismissed', '1'); } catch (error) { /* optional */ }
    setTimeout(() => { popup.hidden = true; }, 500);
  };

  const spin = () => {
    if (spinning || !window.gsap) return;
    spinning = true;
    selection = categories.map(items => Math.floor(Math.random() * items.length));
    spinButton.disabled = true;
    spinButton.innerHTML = 'Spinning&hellip;';
    addButton.hidden = true;
    result.textContent = 'Hopper is picking your bundle…';
    popup.classList.add('is-spinning');
    popup.classList.remove('is-resolved');

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeline = gsap.timeline({
      onComplete: () => {
        const chosen = selection.map((index, category) => categories[category][index]);
        popup.classList.remove('is-spinning');
        popup.classList.add('is-resolved');
        spinButton.disabled = false;
        spinButton.textContent = 'Spin again';
        addButton.innerHTML = `Add bundle & apply ${chosen[2].percent}% <span aria-hidden="true">→</span>`;
        addButton.hidden = false;
        result.textContent = `${chosen[0].name} + ${chosen[1].name} + ${chosen[2].percent}% off`;
        spinning = false;
        addButton.focus();
      }
    });

    slots.forEach((slot, category) => {
      const track = slot.querySelector('.dcb-offer-slot-track');
      const itemHeight = slot.querySelector('.dcb-offer-slot-item').getBoundingClientRect().height;
      const targetIndex = categories[category].length * 3 + selection[category];
      gsap.set(track, { y:0 });
      timeline.to(track, {
        y:-(targetIndex * itemHeight),
        duration:reduced ? 0 : 1.45 + category * .22,
        ease:'power4.out'
      }, 0);
    });
  };

  const addBundle = () => {
    if (!selection || !window.DCB?.cart) return;
    const beer = beers[selection[0]];
    const accessory = accessories[selection[1]];
    const discount = discounts[selection[2]];
    [beer, accessory].forEach(item => DCB.cart.add({
      slug:item.slug,
      name:item.cartName,
      price:item.price,
      currency:'USD',
      package:item.package,
      image:item.image
    }));
    DCB.cart.applyDiscount({
      code:`HOPPER${discount.percent}`,
      percent:discount.percent,
      requiredSlugs:[beer.slug,accessory.slug]
    });
    addButton.textContent = 'Bundle added!';
    addButton.disabled = true;
    close();
    window.setTimeout(() => window.DCB.cart.open(), 520);
  };

  spinButton.addEventListener('click', spin);
  addButton.addEventListener('click', addBundle);
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !popup.hidden) close();
  });

  window.setTimeout(open, forcePreview ? 150 : 4200);
})();
