/* js/index.js
   Extras din index.html. Comportament neschimbat: fisierul e incarcat
   in exact aceeasi pozitie in document ca blocul inline de dinainte. */
/* ================= DATA ================= */
const BEERS = [
  {
    id:'blonde', name:'BLONDE', style:'Ale',
    label:'#D9A126', ink:'#A87409', blob:'#C4890E', labelInk:'#2E1808',
    abv:'4.8% VOL', ibu:'IBU 18', ml:'330 ML',
    desc:"Our Blonde beer is a delightful and refreshing masterpiece. It boasts a light and crisp body with a touch of sweetness, making it perfect for those seeking a smooth and easy-drinking experience. The Blonde is known for its gentle, fruity aroma which brings a touch of sunshine to every sip. Its golden hue and subtle malt flavors make it an absolute crowd-pleaser."
  },
  {
    id:'amber', name:'AMBER', style:'Pale Ale',
    label:'#B23A27', ink:'#A33322', blob:'#93291A', labelInk:'#2E1808',
    abv:'5.4% VOL', ibu:'IBU 28', ml:'330 ML',
    desc:"Seeking a beer with character and depth? Look no further than our Amber ale. This medium-bodied beauty has a rich copper color that catches the eye, while its well-balanced caramel maltiness offers a satisfyingly smooth taste. The Amber's caramel and toasty notes are perfectly complemented by a hint of hops, resulting in a beer that is hearty, yet wonderfully approachable."
  },
  {
    id:'ipa', name:'IPA', style:'India Pale Ale',
    label:'#2F8577', ink:'#25655A', blob:'#226B5E', labelInk:'#2E1808',
    abv:'6.5% VOL', ibu:'IBU 55', ml:'330 ML',
    desc:"For the hop aficionados who crave a bold and hop-forward experience, our IPA (India Pale Ale) is a must-try. Bursting with hop flavors and aromas, this beer brings a delightful bitterness to the forefront. The IPA combines a distinctive grapefruit-like citrus taste with a pleasant floral aroma, creating a beer that is intense, aromatic, and unforgettable. It's the perfect choice for those seeking a hoppy adventure."
  },
  {
    id:'dark', name:'DARK', style:'Lager',
    label:'#2C2925', ink:'#2C2925', blob:'#3A362F', labelInk:'#F4E3C8',
    abv:'5.0% VOL', ibu:'IBU 22', ml:'330 ML',
    desc:"Prepare your taste buds for a rich and robust journey with our Dark beer. This full-bodied delight is characterized by its deep, dark color and complex flavors. With notes of chocolate, coffee, and roasted malts, the Dark beer offers a decadent taste experience. Its smooth and velvety texture, combined with a subtle sweetness, creates a beer that is both indulgent and satisfying. Treat yourself to the luxurious depths of our Dark beer."
  }
];

/* ================= STAR GEOMETRY ================= */
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
/* thin 4-point sparkle/twinkle variant — same generator, sharper inner ratio */
function sparkleSVG(size, fill){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path class="p" fill="${fill}" d="${starPath(12,12,11,4,0.2)}"/></svg>`;
}
/* stamp static stars into placeholders */
document.querySelectorAll('[data-star]').forEach(el=>{
  el.innerHTML = starSVG(+el.dataset.star, el.dataset.fill || '#2E1A0E');
});
document.querySelectorAll('[data-sparkle]').forEach(el=>{
  el.innerHTML = sparkleSVG(+el.dataset.sparkle, el.dataset.fill || '#2E1A0E');
});

/* ================= BOTTLE PHOTO ================= */
function bottleImg(beer, extraClass){
  return `<img class="bottle-photo${extraClass ? ' '+extraClass : ''}" src="assets/bottle-${beer.id}.png"
               alt="${beer.name} ${beer.style} bottle" loading="lazy">`;
}

/* ================= STATE / RENDER ================= */
const $ = s => document.querySelector(s);
let active = 0;

/* light-to-dark, matching the selector order below */
const lineupOrder = [0,1,2,3];
$('#lineup').innerHTML = lineupOrder.map(i=>
  `<button data-beer="${i}" aria-label="View ${BEERS[i].name} ${BEERS[i].style}">${bottleImg(BEERS[i])}</button>`
).join('');

/* editorial product shelf — the whole family stays visible at a glance */
$('#brew-shelf').innerHTML = BEERS.map((b,i)=>
  `<button class="brew-card" data-beer="${i}" aria-pressed="${i===0}" style="--tone:${b.label}" aria-label="View ${b.name} ${b.style}">
     <span class="brew-card-spark" aria-hidden="true">✦</span>
     ${bottleImg(b)}
     <span class="brew-card-label"><strong>${b.name}</strong><small>${b.style} · 0${i+1}</small></span>
   </button>`
).join('');
$('#brew-dots').innerHTML = BEERS.map((b,i)=>
  `<button class="brew-dot" type="button" data-brew-dot="${i}" aria-label="Show ${b.name} ${b.style}" aria-current="${i===0}"></button>`
).join('');

/* story stars row */

function selectBeer(i, animate = true){
  active = ((i % BEERS.length) + BEERS.length) % BEERS.length;
  const b = BEERS[active];

  document.documentElement.style.setProperty('--beer', b.label);
  document.documentElement.style.setProperty('--beer-ink', b.ink);
  document.documentElement.style.setProperty('--beer-blob', b.blob);

  const nameEl = $('#beer-name');
  nameEl.textContent = `${b.name} ${b.style}`;
  $('#beer-desc').textContent = b.desc;
  $('#beer-meta').innerHTML = [b.ml,b.abv,b.ibu].map(m=>`<span>${m}</span>`).join('');
  $('#beer-page-link').href = `beer.html?brew=${b.id}`;
  document.querySelector('.brew-detail')?.style.setProperty('--detail-accent',b.ink);

  document.querySelectorAll('.brew-card').forEach((card,idx)=>card.setAttribute('aria-pressed',String(idx===active)));
  document.querySelectorAll('.brew-dot').forEach((dot,idx)=>dot.setAttribute('aria-current',String(idx===active)));
}
selectBeer(0, false);

/* ================= PRODUCT SHELF: SWIPE + EDGE TAP ================= */
(function(){
  const shelf=$('#brew-shelf');
  if(!shelf) return;
  const cards=[...shelf.querySelectorAll('.brew-card')];
  const go=i=>{
    const next=((i%cards.length)+cards.length)%cards.length;
    selectBeer(next);
    cards[next].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'center'});
  };
  document.querySelector('.shelf-edge-prev')?.addEventListener('click',()=>go(active-1));
  document.querySelector('.shelf-edge-next')?.addEventListener('click',()=>go(active+1));
  document.querySelectorAll('[data-brew-dot]').forEach(dot=>dot.addEventListener('click',()=>go(+dot.dataset.brewDot)));
  let ticking=false;
  shelf.addEventListener('scroll',()=>{
    if(ticking||innerWidth>520) return;
    ticking=true;
    requestAnimationFrame(()=>{
      const center=shelf.scrollLeft+shelf.clientWidth/2;
      let closest=0,distance=Infinity;
      cards.forEach((card,index)=>{const d=Math.abs(card.offsetLeft+card.offsetWidth/2-center);if(d<distance){distance=d;closest=index}});
      selectBeer(closest,false);ticking=false;
    });
  },{passive:true});
})();

/* clicks */
document.addEventListener('click', e=>{
  const beerBtn = e.target.closest('[data-beer]');
  if(beerBtn){
    selectBeer(+beerBtn.dataset.beer);
    if(beerBtn.closest('#lineup')){
      if(lenis) lenis.scrollTo('#products', {offset:-76});
      else $('#products').scrollIntoView({behavior:'smooth'});
    }
    return;
  }
  const toastBtn = e.target.closest('[data-toast]');
  if(toastBtn){ e.preventDefault(); showToast(toastBtn.dataset.toast); }
});
document.addEventListener('keydown', e=>{
  if(e.target.closest('input,textarea')) return;
  if(e.key==='ArrowRight') selectBeer(active+1);
  if(e.key==='ArrowLeft')  selectBeer(active-1);
});

/* ================= MENU ================= */
const menu = $('#menu');
$('#menu-open').addEventListener('click', ()=>{menu.classList.add('is-open'); document.body.style.overflow='hidden';});
function closeMenu(){menu.classList.remove('is-open'); document.body.style.overflow='';}
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

/* ================= SMOOTH SCROLL (Lenis) + HERO PARALLAX ================= */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
if(!reduceMotion && window.Lenis){
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  (function raf(time){ lenis.raf(time); requestAnimationFrame(raf); })();

  const heroBand = document.querySelector('.hero-band');
  const heroTitle = document.querySelector('.hero-title');
  const heroLineup = document.querySelector('.lineup');
  if(heroBand && heroTitle && heroLineup){
    lenis.on('scroll', ({ scroll }) => {
      const heroH = heroBand.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, scroll / heroH));
      // headline drifts down (reads as "farther away"), bottles rise faster
      // (reads as "closer") — opposite directions is what sells the depth
      heroTitle.style.transform  = `translateY(${(p * 46).toFixed(1)}px)`;
      heroLineup.style.transform = `translateY(${(p * -64).toFixed(1)}px)`;
    });
  }
}

/* ================= LOADER ================= */
const splash = $('#splash');
if(sessionStorage.getItem('dcb-splash') || reduceMotion || location.search.includes('noloader')){
  splash.remove();
}else{
  sessionStorage.setItem('dcb-splash','1');
  const pct = $('#pour-pct');
  const t0 = performance.now(), DUR = 1200;
  (function tick(now){
    const p = Math.min(1, (now - t0) / DUR);
    pct.textContent = Math.round(p * 100) + '%';
    if(p < 1){ requestAnimationFrame(tick); }
    else{
      splash.classList.add('is-done');
      splash.addEventListener('animationend', ()=>splash.remove(), {once:true});
    }
  })(t0);
}

/* ================= MARQUEE ================= */
(function(){
  const items = ['Brewed in small batches','Drink David Craft Ale','Est. 2023','One for everyone','Chill for best results'];
  const star = `<span class="sep">${starSVG(15,'#FFC24B')}</span>`;
  const baseSeq = items.map(t=>`<span>${t}</span>`).join(star) + star;
  const BASE_DUR = 26; // seconds, tuned for one un-repeated sequence's width

  const track = $('#marquee-track');
  track.innerHTML = baseSeq;
  const baseWidth = track.scrollWidth || 1;
  // each "half" (one copy in the -50% loop) must be wider than the widest
  // plausible viewport, or the loop shows a gap of bare background before it resets
  const targetWidth = Math.max(document.documentElement.clientWidth, screen.width || 0) * 1.25;
  const repeats = Math.max(1, Math.ceil(targetWidth / baseWidth));

  const half = baseSeq.repeat(repeats);
  track.innerHTML = half + half; /* duplicated for a seamless -50% loop */
  track.style.animationDuration = (BASE_DUR * repeats) + 's'; /* keep scroll speed constant regardless of repeat count */
})();

/* ================= ROTATING BADGE ================= */
(function(){
  const R = 34, C = 46;
  $('#badge-spin').innerHTML = `
  <svg viewBox="0 0 92 92" aria-hidden="true">
    <defs><path id="badge-arc" d="M ${C} ${C} m -${R},0 a ${R},${R} 0 1,1 ${R*2},0 a ${R},${R} 0 1,1 -${R*2},0"/></defs>
    <circle cx="${C}" cy="${C}" r="45" fill="#FFC24B"/>
    <path d="${starPath(C, C, 13)}" fill="#572010"/>
    <text font-family="'Hanken Grotesk'" font-weight="800" font-size="10.5" letter-spacing="2.4" fill="#572010">
      <textPath href="#badge-arc">DAVID CRAFT ALE · EST 2023 ·</textPath>
    </text>
  </svg>`;
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

/* ================= STORY TITLE — SCROLL-LINKED ENTRY ================= */
(function(){
  const section=document.querySelector('#story');
  const title=section?.querySelector('.story-scroll-title');
  if(!section||!title||reduceMotion) return;
  let queued=false,last=-1;
  function update(){
    /* measured off the title itself, not the section, so the fill
       completes while the headline is actually on screen */
    const rect=title.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight*.82)));
    const eased=1-Math.pow(1-progress,2);
    const pct=Math.round(eased*100);
    if(pct!==last){title.style.setProperty('--story-title-fill',pct+'%');last=pct}
    queued=false;
  }
  function requestUpdate(){
    if(!queued){queued=true;requestAnimationFrame(update)}
  }
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  lenis?.on('scroll',requestUpdate);
  update();
})();

/* ================= HOPPER (stationary hoverers) ================= */
(function(){
  const puppet = `<img class="f1" src="assets/hopper-up.png" alt="" onerror="this.parentElement.remove()">
                  <img class="f2" src="assets/hopper-down.png" alt="">`;
  document.querySelectorAll('.hover-hopper').forEach(el=>{ el.innerHTML = puppet; });
})();

/* ================= HOPPER FLIGHTS ================= */
(function(){
  if(reduceMotion) return;
  const flights = [
    {host:'.hero-band',  top:'16%', size:52, dur:24, delay:-6,  rtl:false}
  ];
  flights.forEach(f=>{
    const host = document.querySelector(f.host);
    if(!host) return;
    const d = document.createElement('div');
    d.className = 'hopper' + (f.rtl ? ' rtl' : '');
    d.setAttribute('aria-hidden','true');
    d.style.cssText = `--h-top:${f.top};--h-size:${f.size}px;--h-dur:${f.dur}s;--h-delay:${f.delay}s`;
    d.innerHTML = `<span class="bob">
      <img class="f1" src="assets/hopper-up.png" alt="" onerror="this.closest('.hopper').remove()">
      <img class="f2" src="assets/hopper-down.png" alt="">
    </span>`;
    host.appendChild(d);
  });
})();

/* ================= HERO HOPPER: CHASES THE CURSOR (desktop) =================
   Scoped to the hero band only — he still lives nowhere else on the page,
   per the "hero + reviews only" rule. When the cursor is over the hero he
   chases it (eased, not snapped, so it reads as a pet trailing behind);
   otherwise he eases back to the exact spot he'd sit at in normal flow. */
(function(){
  if(reduceMotion) return;
  const el = document.querySelector('.hero-band .hover-hopper');
  const band = document.querySelector('.hero-band');
  if(!el || !band) return;
  const mq = matchMedia('(pointer:fine) and (min-width:861px)');
  let mx = 0, my = 0, hasMouse = false, cx = 0, cy = 0, crot = -9, raf = null, homeX = 0, homeY = 0;

  function onMove(e){ mx = e.clientX; my = e.clientY; hasMouse = true; }

  const btn = document.querySelector('.hero-cta .btn');
  function captureHome(){
    // Anchored to the button, not to Hopper's own pre-roam position: switching
    // him to position:absolute removes him from the flex row, so the button
    // and mug-badge immediately re-center WITHOUT him — a home captured from
    // the old 3-item layout no longer lines up with that new 2-item layout,
    // and he'd rest right on top of the button. The button (still a normal
    // flex item, unaffected by Hopper's own position) is the stable reference.
    if(!btn) return;
    const cta = document.querySelector('.hero-cta');
    const gap = parseFloat(getComputedStyle(cta).columnGap) || 16;
    const b = band.getBoundingClientRect(), btnRect = btn.getBoundingClientRect();
    const w = el.offsetWidth || 144, h = el.offsetHeight || (w * 241/262);
    homeX = (btnRect.left - b.left) - gap - w;
    homeY = (btnRect.top - b.top) + (btnRect.height - h) / 2;
  }

  function tick(now){
    const b = band.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight, inset = 6;
    // before the cursor has genuinely moved, mx/my are meaningless — without
    // this guard he'd "engage" toward a stale (0,0)-ish point reinterpreted
    // against wherever the band has scrolled to, and could drift into content
    const engaged = hasMouse && my >= b.top - 20 && my <= b.bottom + 20 && mx >= b.left - 20 && mx <= b.right + 20;
    let tx, ty;
    if(engaged){
      tx = Math.max(inset, Math.min(b.width  - w - inset, (mx - b.left) - w/2));
      ty = Math.max(inset, Math.min(b.height - h - inset, (my - b.top)  - h/2));
    } else {
      tx = homeX; ty = homeY;
    }
    const dx = tx - cx;
    cx += dx * .1;
    cy += (ty - cy) * .1;
    const targetRot = Math.max(-20, Math.min(20, dx / 6));
    crot += (targetRot - crot) * .12;
    const bob = Math.sin(now / 320) * (engaged ? 3 : 6);
    el.style.transform = `translate(${cx.toFixed(1)}px, ${(cy + bob).toFixed(1)}px) rotate(${crot.toFixed(1)}deg)`;
    raf = requestAnimationFrame(tick);
  }
  function enable(){
    if(raf) return;
    el.classList.add('hopper-roam'); // out of flow FIRST, so the button/badge
    captureHome();                   // have already re-centered when measured
    cx = homeX; cy = homeY;
    el.style.transform = `translate(${homeX}px, ${homeY}px) rotate(-9deg)`;
    document.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
  }
  function disable(){
    if(raf){ cancelAnimationFrame(raf); raf = null; }
    document.removeEventListener('mousemove', onMove);
    el.classList.remove('hopper-roam');
    el.style.transform = '';
  }
  mq.addEventListener('change', ()=> mq.matches ? enable() : disable());
  mq.matches ? enable() : disable();
  // captureHome() runs at script-execution time, before the custom display
  // face has finished loading — button width (and so hopper's true resting
  // spot) can still shift once it swaps in. Re-measure once fonts settle so
  // "home" matches final layout, not a stale fallback-font snapshot.
  document.fonts?.ready?.then(()=>{ if(raf) captureHome(); });
})();

/* ================= VIDEO FALLBACKS ================= */
document.querySelectorAll('#story-video, #mug-video').forEach(v=>{
  v.addEventListener('error', ()=>{ v.remove(); }, true);
  if(reduceMotion){ v.removeAttribute('autoplay'); v.pause?.(); }
});
