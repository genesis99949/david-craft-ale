/* js/products.js
   Extras din products.html. Comportament neschimbat: fisierul e incarcat
   in exact aceeasi pozitie in document ca blocul inline de dinainte. */
const $ = s => document.querySelector(s);

/* ================= STARS ================= */
function starPath(cx, cy, R, points = 8, innerRatio = 0.42){
  const r = R * innerRatio, step = Math.PI / points;
  let d = '';
  for(let i = 0; i < points * 2; i++){
    const rad = i % 2 === 0 ? R : r;
    const a = i * step - Math.PI / 2;
    d += (i === 0 ? 'M' : 'L') + (cx + rad * Math.cos(a)).toFixed(2) + ' ' + (cy + rad * Math.sin(a)).toFixed(2);
  }
  return d + 'Z';
}
function starSVG(size, fill){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path class="p" fill="${fill}" d="${starPath(12,12,11)}"/></svg>`;
}
function sparkleSVG(size, fill){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path class="p" fill="${fill}" d="${starPath(12,12,11,4,0.2)}"/></svg>`;
}
document.querySelectorAll('[data-star]').forEach(el=>{
  el.innerHTML = starSVG(+el.dataset.star, el.dataset.fill || '#2E1A0E');
});
document.querySelectorAll('[data-sparkle]').forEach(el=>{
  el.innerHTML = sparkleSVG(+el.dataset.sparkle, el.dataset.fill || '#2E1A0E');
});

/* ================= MENU ================= */
const menu = $('#menu');
function syncBodyScrollLock(){
  const overlayOpen = menu.classList.contains('is-open') ||
    document.querySelector('#cart-drawer')?.classList.contains('is-open') ||
    document.querySelector('#quick-view')?.classList.contains('is-open');
  document.body.style.overflow = overlayOpen ? 'hidden' : '';
}
$('#menu-open').addEventListener('click', ()=>{menu.classList.add('is-open');syncBodyScrollLock();});
function closeMenu(){menu.classList.remove('is-open');syncBodyScrollLock();}
$('#menu-close').addEventListener('click', closeMenu);
document.querySelectorAll('[data-menu-link]').forEach(a=>a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeMenu(); });

/* ================= TOAST ================= */
let toastTimer;
function showToast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
}
document.addEventListener('click', e=>{
  const toastBtn = e.target.closest('[data-toast]');
  if(toastBtn){ e.preventDefault(); showToast(toastBtn.dataset.toast); }
});

/* Format shortcuts also position horizontally hidden products inside a rail. */
document.querySelectorAll('.shop-jump-nav a[href^="#"]').forEach(link=>{
  link.addEventListener('click',event=>{
    const target = document.querySelector(link.getAttribute('href'));
    const rail = target?.closest('.full-lineup-grid');
    if(!target || !rail) return;
    event.preventDefault();
    history.pushState(null,'',link.getAttribute('href'));
    target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start',inline:'nearest'});
    const gutter = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
    rail.scrollTo({left:Math.max(0,target.offsetLeft-gutter),behavior:reduceMotion?'auto':'smooth'});
  });
});

/* Cart state and the drawer live in shop.js now, shared by every page.
   This only turns a product card into an item and hands it over. */
function addCardToCart(card,addButton){
  if(!card || !addButton) return;
  const slug = card.dataset.productSlug;
  const productName = addButton.dataset.addToCart || card.querySelector('.prod-card-name')?.textContent.trim() || 'Product';
  window.DCB?.cart.add({
    slug,
    name: productName,
    price: card.dataset.productPrice || '2.49',
    currency: 'USD',
    package: card.dataset.productPackage || 'Product',
    image: card.querySelector('.prod-card-photo img').getAttribute('src')
  });
  showToast(`${productName} added to cart.`);

  const labelNode = addButton.firstChild;
  if(labelNode?.nodeType === Node.TEXT_NODE){
    labelNode.textContent = 'Added ';
    window.setTimeout(()=>{ labelNode.textContent = 'Add to cart '; },1200);
  }
}

document.addEventListener('click', e=>{
  const addButton = e.target.closest('[data-add-to-cart]');
  if(!addButton) return;
  addCardToCart(addButton.closest('[data-product-slug]'),addButton);
});


/* ================= SMOOTH SCROLL (Lenis) ================= */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
if(!reduceMotion && window.Lenis){
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  (function raf(time){ lenis.raf(time); requestAnimationFrame(raf); })();
}

/* ================= PRODUCT QUICK VIEW ================= */
const quickView = $('#quick-view');
const quickViewDialog = quickView.querySelector('.quick-view-dialog');
const quickViewClose = $('#quick-view-close');
const quickViewImage = $('#quick-view-image');
const quickViewTitle = $('#quick-view-title');
const quickViewDescription = $('#quick-view-description');
const quickViewPrice = $('#quick-view-price');
const quickViewPackage = $('#quick-view-package');
const quickViewAdd = $('#quick-view-add');
const quickViewDetails = $('#quick-view-details');
let quickViewCard = null;
let quickViewReturnFocus = null;

const productDescriptions = {
  'blonde-ale-bottle':'The bright, easygoing member of the David Craft Ale family, presented in the classic individual bottle.',
  'amber-pale-ale-bottle':'A characterful amber pour with a warm personality, ready in the classic individual bottle.',
  'ipa-bottle':'David Craft Ale IPA brings the lineup’s bold, hop-forward attitude to the classic individual bottle.',
  'dark-lager-bottle':'The deeper, darker side of the Four Brews, presented in the classic individual bottle.',
  'blonde-ale-bottle-six-pack':'Six Blonde Ale bottles gathered in one share-ready carrier for the fridge, table or next get-together.',
  'amber-pale-ale-bottle-six-pack':'Six Amber Pale Ale bottles in a characterful carrier made for sharing a warmer David Craft Ale pour.',
  'ipa-bottle-six-pack':'Six IPA bottles packed together when one bold, hop-forward David Craft Ale is simply not enough.',
  'dark-lager-bottle-six-pack':'Six Dark Lager bottles in one carrier for keeping the deeper David Craft Ale pour close at hand.',
  'blonde-ale-can':'The bright, easygoing Blonde Ale in a portable individual can that is ready to travel.',
  'amber-pale-ale-can':'Amber Pale Ale’s warm character in a colorful individual can made for easy carrying.',
  'ipa-can':'The bold, hop-forward member of the family in a portable individual can.',
  'dark-lager-can':'The deeper, darker David Craft Ale pour in a portable individual can with plenty of personality.',
  'blonde-ale-can-six-pack':'Six portable Blonde Ale cans packed together for picnics, parties and a well-stocked fridge.',
  'amber-pale-ale-can-six-pack':'Six Amber Pale Ale cans gathered into one easy-carry pack for sharing.',
  'ipa-can-six-pack':'Six bold IPA cans in one portable pack, ready for wherever good company gathers.',
  'dark-lager-can-six-pack':'Six Dark Lager cans packed together for taking the deeper David Craft Ale pour along.',
  'hopper-plushie':'Soft, squishy and full of personality. Give David Craft Ale’s favorite winged sidekick a permanent place on your shelf, sofa or bar cart.',
  'hopper-beer-mats':'A set of four Hopper beer mats that brings the David Craft Ale mascot to every pour while helping protect the table.',
  'hopper-bottle-opener':'A compact metal bottle opener featuring Hopper, made to stay close whenever a David Craft Ale bottle needs opening.',
  'hopper-pint-glass':'A David Craft Ale pint glass featuring Hopper, ready to give the pour a proper home and the shelf more personality.'
};

const beerDetailKeys = {
  'blonde-ale':'blonde',
  'amber-pale-ale':'amber',
  'ipa':'ipa',
  'dark-lager':'dark'
};

function beerDetailHref(slug=''){
  const beerBase=Object.keys(beerDetailKeys).find(base=>slug===`${base}-bottle`||slug===`${base}-can`||slug===`${base}-bottle-six-pack`||slug===`${base}-can-six-pack`);
  if(!beerBase) return '';
  const container=slug.includes('-can')?'can':'bottle';
  const pack=slug.endsWith('-six-pack')?'six':'single';
  return `beer.html?brew=${beerDetailKeys[beerBase]}&container=${container}&pack=${pack}`;
}

function openQuickView(card){
  if(!card) return;
  const productImage = card.querySelector('.prod-card-photo img');
  const productName = card.querySelector('.prod-card-name')?.textContent.trim() || 'David Craft Ale product';
  const productPrice = card.querySelector('.prod-card-price');
  const quantity = productPrice?.querySelector('small')?.textContent.trim();
  const originalAdd = card.querySelector('[data-add-to-cart]');
  quickViewCard = card;
  quickViewReturnFocus = card;
  quickView.classList.toggle('is-individual-bottle',[
    'blonde-ale-bottle','amber-pale-ale-bottle','ipa-bottle','dark-lager-bottle'
  ].includes(card.dataset.productSlug));
  quickViewImage.src = productImage?.getAttribute('src') || '';
  quickViewImage.alt = productImage?.alt || productName;
  quickViewTitle.textContent = productName;
  quickViewDescription.textContent = productDescriptions[card.dataset.productSlug] || 'A member of the David Craft Ale lineup, made to bring more character to the moment.';
  quickViewPrice.textContent = (productPrice?.childNodes[0]?.textContent || `${card.dataset.productPrice || '2.49'} USD`).trim();
  quickViewPackage.textContent = [card.dataset.productPackage,quantity].filter(Boolean).join(' · ');
  quickViewAdd.dataset.addToCart = originalAdd?.dataset.addToCart || productName;
  const detailsHref=beerDetailHref(card.dataset.productSlug);
  quickViewDetails.hidden=!detailsHref;
  if(detailsHref) quickViewDetails.href=detailsHref;
  quickView.classList.add('is-open');
  quickView.setAttribute('aria-hidden','false');
  syncBodyScrollLock();
  window.setTimeout(()=>quickViewClose.focus(),reduceMotion?0:480);
}

function closeQuickView(){
  if(!quickView.classList.contains('is-open')) return;
  quickView.classList.remove('is-open');
  quickView.setAttribute('aria-hidden','true');
  syncBodyScrollLock();
  const returnTarget = quickViewReturnFocus;
  quickViewCard = null;quickViewReturnFocus = null;
  quickView.classList.remove('is-individual-bottle');
  returnTarget?.focus();
}

document.querySelectorAll('.full-lineup-grid [data-product-slug]').forEach(card=>{
  const name = card.querySelector('.prod-card-name')?.textContent.trim() || 'product';
  card.tabIndex = 0;
  card.setAttribute('aria-haspopup','dialog');
  card.setAttribute('aria-label',`View ${name} details`);
  card.addEventListener('click',event=>{
    if(event.target.closest('button,a,input,select,textarea')) return;
    openQuickView(card);
  });
  card.addEventListener('keydown',event=>{
    if(event.target !== card || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();openQuickView(card);
  });
});

quickViewClose.addEventListener('click',closeQuickView);
quickView.addEventListener('pointerdown',event=>{
  if(event.target === quickView) closeQuickView();
});
quickViewAdd.addEventListener('click',()=>{
  if(!quickViewCard) return;
  addCardToCart(quickViewCard,quickViewAdd);
});
quickViewDialog.addEventListener('keydown',event=>{
  if(event.key === 'Escape'){
    event.preventDefault();event.stopPropagation();closeQuickView();return;
  }
  if(event.key !== 'Tab') return;
  const focusable = Array.from(quickViewDialog.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'));
  if(!focusable.length) return;
  const first = focusable[0],last = focusable[focusable.length-1];
  if(event.shiftKey && document.activeElement === first){event.preventDefault();last.focus();}
  else if(!event.shiftKey && document.activeElement === last){event.preventDefault();first.focus();}
});
document.addEventListener('keydown',event=>{
  if(event.key === 'Escape' && quickView.classList.contains('is-open')) closeQuickView();
});

/* ================= FULL LINEUP HOPPER =================
   Desktop fine-pointer only. Hopper trails the cursor by a small vector derived
   from pointer delta, then eases toward that target and remains clamped inside the band. */
(function(){
  const section = document.querySelector('.full-lineup-section');
  const hopper = document.querySelector('#lineup-chaser');
  const pointerMode = matchMedia('(min-width: 861px) and (pointer: fine)');
  if(!section || !hopper || reduceMotion || !pointerMode.matches) return;

  let currentX = 0, currentY = 0, targetX = 0, targetY = 0;
  let lastX = 0, lastY = 0, hasPoint = false, rafId = 0;
  const pad = 14;

  function clampTarget(x,y){
    const box = section.getBoundingClientRect();
    const hw = hopper.offsetWidth, hh = hopper.offsetHeight;
    let nx = Math.max(pad, Math.min(box.width - hw - pad, x));
    let ny = Math.max(pad, Math.min(box.height - hh - pad, y));
    const cx = nx + hw/2, cy = ny + hh/2;
    section.querySelectorAll('[data-add-to-cart]').forEach(button=>{
      const b = button.getBoundingClientRect();
      const left = b.left - box.left - 12, right = b.right - box.left + 12;
      const top = b.top - box.top - 12, bottom = b.bottom - box.top + 12;
      if(cx > left && cx < right && cy > top && cy < bottom){
        ny = Math.max(pad, top - hh - 10);
      }
    });
    return [nx,ny];
  }

  function tick(){
    currentX += (targetX-currentX)*.14;
    currentY += (targetY-currentY)*.14;
    hopper.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
    if(Math.abs(targetX-currentX)>.1 || Math.abs(targetY-currentY)>.1) rafId=requestAnimationFrame(tick);
    else rafId=0;
  }

  section.addEventListener('pointermove',event=>{
    const box = section.getBoundingClientRect();
    const dx = hasPoint ? event.clientX-lastX : 0;
    const dy = hasPoint ? event.clientY-lastY : 0;
    const mag = Math.hypot(dx,dy);
    const trail = mag ? Math.min(36,24+mag*.16) : 0;
    const trailX = mag ? dx/mag*trail : 0;
    const trailY = mag ? dy/mag*trail : 0;
    const point = clampTarget(event.clientX-box.left-hopper.offsetWidth/2-trailX,event.clientY-box.top-hopper.offsetHeight/2-trailY);
    targetX=point[0]; targetY=point[1];
    if(!hasPoint){ currentX=targetX; currentY=targetY; }
    hasPoint=true; lastX=event.clientX; lastY=event.clientY;
    hopper.style.opacity='1';
    if(!rafId) rafId=requestAnimationFrame(tick);
  },{passive:true});
  section.addEventListener('pointerleave',()=>{hopper.style.opacity='0';hasPoint=false;});
})();

/* ================= FULL LINEUP VIEW SWITCH ================= */
(function(){
  const section=$('.full-lineup-section');
  const toggle=$('#lineup-view-toggle');
  if(!section||!toggle) return;

  function savedView(){
    try{return localStorage.getItem('dca-lineup-view');}catch(_){return null;}
  }
  function saveView(value){
    try{localStorage.setItem('dca-lineup-view',value);}catch(_){}
  }
  function setGridView(active,persist=false){
    section.classList.toggle('is-grid-view',active);
    toggle.checked=!active;
    section.querySelectorAll('.full-lineup-grid').forEach(rail=>{
      if(active) rail.scrollLeft=0;
      rail.setAttribute('aria-label',rail.getAttribute('aria-label').replace(/, grid view|, carousel view/g,'')+(active?', grid view':', carousel view'));
    });
    if(persist) saveView(active?'grid':'carousel');
  }

  const requestedView=new URLSearchParams(location.search).get('view');
  const storedView=savedView();
  setGridView(requestedView==='grid'||(requestedView!=='carousel'&&storedView!=='carousel'));
  toggle.addEventListener('change',()=>setGridView(!toggle.checked,true));
})();

/* ================= FULL LINEUP CAROUSELS ================= */
document.querySelectorAll('.full-lineup-grid').forEach(carousel=>{
  carousel.querySelectorAll('img').forEach(image=>image.draggable=false);
  carousel.addEventListener('dragstart',event=>event.preventDefault());
  const pager=document.querySelector(`[data-carousel-pager="${carousel.id}"]`);
  const pagerButtons=pager?Array.from(pager.querySelectorAll('button')):[];
  const step=()=>Math.max(1,carousel.clientWidth);
  const update=()=>{
    const maxScroll=Math.max(0,carousel.scrollWidth-carousel.clientWidth);
    carousel.classList.toggle('is-at-end',carousel.scrollLeft>=maxScroll-2);
    if(pagerButtons.length){
      const activeIndex=carousel.scrollLeft>=maxScroll/2?1:0;
      pagerButtons.forEach((button,index)=>{
        const active=index===activeIndex;
        button.classList.toggle('is-active',active);
        button.setAttribute('aria-current',String(active));
      });
    }
  };
  pagerButtons.forEach((button,index)=>button.addEventListener('click',()=>{
    const maxScroll=Math.max(0,carousel.scrollWidth-carousel.clientWidth);
    carousel.scrollTo({left:index===0?0:maxScroll,behavior:reduceMotion?'auto':'smooth'});
  }));
  carousel.addEventListener('keydown',event=>{
    if(carousel.closest('.full-lineup-section')?.classList.contains('is-grid-view')) return;
    if(event.key!=='ArrowLeft' && event.key!=='ArrowRight') return;
    event.preventDefault();
    carousel.scrollBy({left:event.key==='ArrowLeft'?-step():step(),behavior:reduceMotion?'auto':'smooth'});
  });
  let pointerId=null,startX=0,startScroll=0,dragged=false;
  carousel.addEventListener('pointerdown',event=>{
    if(carousel.closest('.full-lineup-section')?.classList.contains('is-grid-view')) return;
    if(event.pointerType!=='mouse' || event.button!==0) return;
    pointerId=event.pointerId;startX=event.clientX;startScroll=carousel.scrollLeft;dragged=false;
  });
  carousel.addEventListener('pointermove',event=>{
    if(event.pointerId!==pointerId) return;
    const delta=event.clientX-startX;
    if(!dragged && Math.abs(delta)<6) return;
    if(!dragged){
      dragged=true;carousel.classList.add('is-dragging');
      carousel.setPointerCapture(pointerId);
    }
    carousel.scrollLeft=startScroll-delta;
    event.preventDefault();
  });
  const finishDrag=event=>{
    if(event.pointerId!==pointerId) return;
    if(carousel.hasPointerCapture(pointerId)) carousel.releasePointerCapture(pointerId);
    pointerId=null;carousel.classList.remove('is-dragging');update();
  };
  carousel.addEventListener('pointerup',finishDrag);
  carousel.addEventListener('pointercancel',finishDrag);
  carousel.addEventListener('click',event=>{
    if(!dragged) return;
    event.preventDefault();event.stopPropagation();dragged=false;
  },true);
  carousel.addEventListener('scroll',update,{passive:true});
  new ResizeObserver(update).observe(carousel);
  update();
});

/* ================= MARQUEE ================= */
(function(){
  const items = ['Small batch craft ale','Drink David Craft Ale','Est. 2023','Good beer, good company','Full lineup'];
  const star = `<span class="sep">${starSVG(15,'#FFC24B')}</span>`;
  const baseSeq = items.map(t=>`<span>${t}</span>`).join(star) + star;
  const BASE_DUR = 26;

  const track = $('#marquee-track-products');
  if(!track) return;
  track.innerHTML = baseSeq;
  const baseWidth = track.scrollWidth || 1;
  const targetWidth = Math.max(document.documentElement.clientWidth, screen.width || 0) * 1.25;
  const repeats = Math.max(1, Math.ceil(targetWidth / baseWidth));

  const half = baseSeq.repeat(repeats);
  track.innerHTML = half + half;
  track.style.animationDuration = (BASE_DUR * repeats) + 's';
})();

/* ================= ROTATING BADGES ================= */
(function(){
  const R = 34, C = 46;
  const svg = `
  <svg viewBox="0 0 92 92" aria-hidden="true">
    <defs><path id="badge-arc-p" d="M ${C} ${C} m -${R},0 a ${R},${R} 0 1,1 ${R*2},0 a ${R},${R} 0 1,1 -${R*2},0"/></defs>
    <circle cx="${C}" cy="${C}" r="45" fill="#FFC24B"/>
    <path d="${starPath(C, C, 13)}" fill="#572010"/>
    <text font-family="'Hanken Grotesk'" font-weight="800" font-size="10.5" letter-spacing="2.4" fill="#572010">
      <textPath href="#badge-arc-p">DAVID CRAFT ALE · EST 2023 ·</textPath>
    </text>
  </svg>`;
  document.querySelectorAll('.carousel-badge').forEach((el,i)=>{
    el.innerHTML = svg.replace('badge-arc-p', 'badge-arc-p'+i).replace('#badge-arc-p', '#badge-arc-p'+i);
  });
})();

/* ================= CAROUSEL DOTS =================
   Deterministic scroll-position math, not IntersectionObserver — when every
   card already fits on screen at once (common on wide viewports), an
   observer fires for all of them near-simultaneously and whichever card is
   last in DOM order wins arbitrarily, which is what previously left the
   *last* dot lit at rest instead of the first. */
document.querySelectorAll('.prod-carousel').forEach(carousel=>{
  const cards = Array.from(carousel.querySelectorAll('.prod-card'));
  const dotsEl = document.getElementById('dots-' + carousel.id.replace('carousel-',''));
  if(!dotsEl || !cards.length) return;
  dotsEl.innerHTML = cards.map((_,i)=>`<i class="${i===0?'is-active':''}"></i>`).join('');
  const dots = Array.from(dotsEl.children);
  let ticking = false;
  function updateActive(){
    ticking = false;
    const mid = carousel.scrollLeft + carousel.clientWidth / 2;
    let closest = 0, closestDist = Infinity;
    cards.forEach((c,i)=>{
      const d = Math.abs((c.offsetLeft + c.offsetWidth/2) - mid);
      if(d < closestDist){ closestDist = d; closest = i; }
    });
    dots.forEach(d=>d.classList.remove('is-active'));
    dots[closest]?.classList.add('is-active');
  }
  carousel.addEventListener('scroll', ()=>{
    if(!ticking){ ticking = true; requestAnimationFrame(updateActive); }
  }, {passive:true});
});

/* ================= DISTRIBUTOR LOCATOR ================= */
(function(){
  const form = $('#locator-search');
  if(!form) return;
  const query = $('#locator-query');
  const cards = Array.from(document.querySelectorAll('.location-card'));
  const pins = Array.from(document.querySelectorAll('.map-pin'));
  const filters = Array.from(document.querySelectorAll('[data-location-filter]'));
  const count = $('#locator-count');
  const empty = $('#locator-empty');
  let activeFilter = 'all';

  function selectLocation(id){
    cards.forEach(card=>card.classList.toggle('is-active',card.dataset.locationId===id));
    pins.forEach(pin=>pin.classList.toggle('is-active',pin.dataset.locationId===id));
  }
  function filterLocations(){
    const term = query.value.trim().toLocaleLowerCase();
    let visible = 0, firstVisible = '';
    cards.forEach(card=>{
      const matchesType = activeFilter==='all' || card.dataset.locationType===activeFilter;
      const matchesText = !term || card.dataset.locationSearch.includes(term);
      const show = matchesType && matchesText;
      card.hidden = !show;
      const pin = pins.find(item=>item.dataset.locationId===card.dataset.locationId);
      if(pin) pin.hidden = !show;
      if(show){ visible++; if(!firstVisible) firstVisible=card.dataset.locationId; }
    });
    count.textContent = `${visible} ${visible===1?'place':'places'}`;
    empty.hidden = visible!==0;
    if(firstVisible) selectLocation(firstVisible);
  }
  form.addEventListener('submit',event=>{event.preventDefault();filterLocations();});
  query.addEventListener('input',filterLocations);
  filters.forEach(button=>button.addEventListener('click',()=>{
    activeFilter=button.dataset.locationFilter;
    filters.forEach(item=>{const selected=item===button;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected));});
    filterLocations();
  }));
  cards.forEach(card=>card.querySelector('button').addEventListener('click',()=>selectLocation(card.dataset.locationId)));
  pins.forEach(pin=>pin.addEventListener('click',()=>{
    selectLocation(pin.dataset.locationId);
    const card=cards.find(item=>item.dataset.locationId===pin.dataset.locationId);
    card?.querySelector('button').focus({preventScroll:true});
  }));
})();

/* ================= SCROLL REVEALS ================= */
(function(){
  const els = document.querySelectorAll('.reveal');
  if(reduceMotion || !('IntersectionObserver' in window)){
    els.forEach(el=>el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  },{threshold:.18});
  els.forEach(el=>io.observe(el));
})();

/* ================= VIDEO FALLBACKS ================= */
document.querySelectorAll('.products-hero-bg').forEach(v=>{
  v.addEventListener('error', ()=>{ v.remove(); }, true);
  if(reduceMotion){ v.removeAttribute('autoplay'); v.pause?.(); }
});
