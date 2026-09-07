(() => {
  'use strict';
  const brews = {
  "blonde": {
    "name": "Blonde Ale",
    "title": "Blonde<br>Ale",
    "image": "assets/bottle-blonde.png",
    "accent": "#a87409",
    "wash": "#ffc24b",
    "lead": "Light, crisp and quietly sunny—the easy-going member of the David Craft Ale family.",
    "meta": [
      "330 ml",
      "4.8% vol",
      "IBU 18"
    ],
    "character": "Golden by nature.",
    "story": "A soft malt sweetness meets a gentle fruity aroma and a clean finish. Bright, balanced and easy to come back to, Blonde Ale brings a little sunshine to the table.",
    "features": [
      [
        "Look",
        "Bright gold"
      ],
      [
        "Mood",
        "Long afternoons"
      ],
      [
        "Character",
        "Crisp & easy-going"
      ]
    ],
    "moment": "For long afternoons, an extra chair and the first round with friends.",
    "aroma": "Gentle fruit & soft malt",
    "slug": "blonde-ale-bottle",
    "price": "2.49"
  },
  "amber": {
    "name": "Amber Pale Ale",
    "title": "Amber<br>Pale Ale",
    "image": "assets/bottle-amber.png",
    "accent": "#a33322",
    "wash": "#de795d",
    "lead": "Copper-toned, balanced and built around a confident toasted-malt character.",
    "meta": [
      "330 ml",
      "5.4% vol",
      "IBU 28"
    ],
    "character": "Warm with depth.",
    "story": "Caramel malt and toasty notes shape a smooth, balanced profile, with enough hop character to keep every sip lively. Copper in the glass and warm at heart.",
    "features": [
      [
        "Look",
        "Deep copper"
      ],
      [
        "Mood",
        "Warm gatherings"
      ],
      [
        "Character",
        "Toasty & balanced"
      ]
    ],
    "moment": "For a crowded table, a shared meal and conversations that go on a little longer.",
    "aroma": "Caramel & toasted malt",
    "slug": "amber-pale-ale-bottle",
    "price": "2.49"
  },
  "ipa": {
    "name": "IPA",
    "title": "India Pale<br>Ale",
    "image": "assets/bottle-ipa.png",
    "accent": "#25655a",
    "wash": "#86aaa0",
    "lead": "Aromatic, hop-forward and unapologetically the boldest pour in the lineup.",
    "meta": [
      "330 ml",
      "6.5% vol",
      "IBU 55"
    ],
    "character": "Bold on purpose.",
    "story": "Citrus-led hops, floral aroma and a firm bitterness give this IPA its bold personality. A bright, aromatic pour that makes its presence known.",
    "features": [
      [
        "Look",
        "Golden amber"
      ],
      [
        "Mood",
        "Hoppy adventures"
      ],
      [
        "Character",
        "Citrus & bold"
      ]
    ],
    "moment": "For the curious, the hop lovers and the friend who always chooses something bold.",
    "aroma": "Citrus & floral hops",
    "slug": "ipa-bottle",
    "price": "2.49"
  },
  "dark": {
    "name": "Dark Lager",
    "title": "Dark<br>Lager",
    "image": "assets/bottle-dark.png",
    "accent": "#572010",
    "wash": "#8b624e",
    "lead": "Smooth, roasted and quietly indulgent without becoming heavy.",
    "meta": [
      "330 ml",
      "5.0% vol",
      "IBU 22"
    ],
    "character": "Depth, made smooth.",
    "story": "Chocolate, coffee and roasted-malt notes give Dark Lager its depth. Smooth and rounded, it brings the darker side of the lineup to an easy-going finish.",
    "features": [
      [
        "Look",
        "Deep brown"
      ],
      [
        "Mood",
        "Slow evenings"
      ],
      [
        "Character",
        "Roasted & smooth"
      ]
    ],
    "moment": "For slow evenings, familiar faces and one more story around the table.",
    "aroma": "Coffee & roasted malt",
    "slug": "dark-lager-bottle",
    "price": "2.49"
  }
};
  const requested = new URLSearchParams(location.search).get('brew');
  const key = Object.hasOwn(brews, requested) ? requested : 'blonde';
  const brew = brews[key];
  const variantState = {container:'bottle',pack:'single'};
  const currentVariant = () => {
    const isBottle = variantState.container === 'bottle';
    const isSix = variantState.pack === 'six';
    const containerName = isBottle ? 'Bottle' : 'Can';
    const baseSlug = brew.slug.replace('-bottle',`-${variantState.container}`);
    return {
      slug:`${baseSlug}${isSix?'-six-pack':''}`,
      name:`${brew.name} ${containerName}${isSix?' Six-Pack':''}`,
      price:isSix?(isBottle?'13.99':'10.99'):(isBottle?'2.49':'1.99'),
      package:isSix?`${containerName} six-pack`:`Individual ${variantState.container}`,
      image:isSix
        ? `assets/sixpack-${isBottle?'bottles':'cans'}-${key}.png`
        : `assets/${isBottle?'bottle':'can'}-${key}.png`,
      unitLabel:isSix?`Six ${isBottle?'bottles':'cans'}`:`One ${variantState.container}`,
      volume:isSix?'6 × 330 ml':'330 ml',
      caption:isSix?`The ${containerName.toLowerCase()} six-pack`:`The ${variantState.container}`
    };
  };
  const $ = selector => document.querySelector(selector);
  const set = (selector, text) => { $(selector).textContent = text; };
  document.title = `${brew.name} | David Craft Ale`;
  $('meta[name="description"]').setAttribute('content', `${brew.name}: ${brew.lead} Meet the four David Craft Ale brews.`);
  document.body.style.setProperty('--brew-accent', brew.accent);
  document.body.style.setProperty('--brew-wash', brew.wash);
  $('#brew-title').innerHTML = brew.title;
  set('#brew-lead', brew.lead);
  set('#brew-volume', brew.meta[0]); set('#brew-abv', brew.meta[1]); set('#brew-ibu', brew.meta[2]);
  set('#character-title', brew.character); set('#brew-story', brew.story); set('#brew-moment', brew.moment);
  set('#brew-look', brew.features[0][1]); set('#brew-mood', brew.features[1][1]);
  set('#brew-palate', brew.features[2][1]); set('#brew-aroma', brew.aroma);
  $('#brew-image').src = brew.image; $('#brew-image').alt = `${brew.name} bottle`;
  ['back','table'].forEach(view => {
    const photo = $(`#brew-${view}`);
    const stem = `${key}-${view}${key === 'dark' ? '-v2' : ''}`;
    photo.src = `assets/beer-gallery/${stem}-800.webp`;
    photo.srcset = [480,800,1536].map(width => `assets/beer-gallery/${stem}-${width}.webp ${width}w`).join(', ');
    photo.alt = view === 'back' ? `${brew.name} bottle viewed from the back` : `${brew.name} bottle and glass on a wooden table`;
  });
  document.querySelectorAll('[data-brew]').forEach(link => {
    if (link.dataset.brew === key) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  const recommendations = [
    ...Object.entries(brews).filter(([other]) => other !== key).map(([other,item]) => ({
      name:item.name,image:item.image,alt:`${item.name} bottle`,href:`beer.html?brew=${other}`,cta:'Meet this brew'
    })),
    {name:`${brew.name} Bottle Six-Pack`,image:`assets/sixpack-bottles-${key}.png`,alt:`Six ${brew.name} bottles in a carrier`,href:`products.html#${brew.slug}-six-pack`,cta:'See the six-pack'},
    {name:`${brew.name} Can Six-Pack`,image:`assets/sixpack-cans-${key}.png`,alt:`Six ${brew.name} cans in a carrier`,href:`products.html#${brew.slug.replace('-bottle','-can')}-six-pack`,cta:'See the six-pack'},
    {name:'Hopper Plushie',image:'assets/Plushie_nobg.png',alt:'Hopper, the winged hop plushie',href:'hopper.html',cta:'Meet Hopper'},
    {name:'Hopper Pint Glass',image:'assets/hopper-pint-glass.png',alt:'Hopper branded pint glass',href:'products.html#hopper-pint-glass',cta:'Take a closer look'},
    {name:'Hopper Beer Mats',image:'assets/hopper-beer-mats.png',alt:'Set of four Hopper beer mats',href:'products.html#hopper-beer-mats',cta:'Take a closer look'}
  ];
  $('#related-beers').innerHTML = recommendations.map(item => `
    <a class="bp-slider-card bp-related" href="${item.href}">
      <div class="bp-slider-photo"><img src="${item.image}" alt="${item.alt}" loading="lazy"></div>
      <h3>${item.name}</h3>
      <span class="bp-slider-link">${item.cta} <span aria-hidden="true">→</span></span>
    </a>`).join('');

  $('#buy-beer').addEventListener('click', () => {
    const variant=currentVariant();
    window.DCB?.cart.add({...variant,currency:'USD'});
    window.DCB?.cart.open();
  });

  // Match Hopper's gallery: arrows, direct selection, keyboard and touch.
  if (key !== 'ipa') $('[data-brew-only="ipa"]')?.remove?.();
  const gallery = $('#beer-gallery'), allSlides = [...gallery.querySelectorAll('figure')], dots = $('.hp-dots'), galleryControls = $('.hp-gallery__controls');
  gallery.setAttribute('aria-label',`${brew.name} product images`);
  let slides = [...allSlides], current = 0, touch = null;
  function show(next) {
    current = (next + slides.length) % slides.length;
    allSlides.forEach(slide => {slide.removeAttribute('data-active');slide.setAttribute('aria-hidden','true');});
    slides.forEach((slide,index) => {
      if(index === current){slide.setAttribute('data-active','true');slide.setAttribute('aria-hidden','false');}
    });
    [...dots.children].forEach((dot,index) => dot.setAttribute('aria-current',String(index === current)));
    const caption = slides[current].querySelector('figcaption').textContent;
    set('#gallery-status',`Image ${current + 1} of ${slides.length}: ${caption}`);
  }
  function rebuildDots(){
    dots.innerHTML='';
    slides.forEach((slide,index) => {
      const dot = document.createElement('button');
      dot.type = 'button';dot.setAttribute('aria-label',`Show ${slide.querySelector('figcaption').textContent.toLowerCase()}`);
      dot.addEventListener('click',() => show(index));dots.appendChild(dot);
    });
  }
  function renderVariant(){
    const variant=currentVariant();
    document.querySelectorAll('[data-variant-container]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.variantContainer === variantState.container)));
    document.querySelectorAll('[data-variant-pack]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.variantPack === variantState.pack)));
    set('#variant-price',`${variant.price} USD`);
    set('#variant-package',variant.package);
    set('#brew-unit-label',variant.unitLabel);
    set('#brew-volume',variant.volume);
    const mainPhoto=$('#brew-image'),mainSlide=allSlides[0];
    mainPhoto.src=variant.image;mainPhoto.alt=variant.name;
    mainSlide.querySelector('figcaption').textContent=variant.caption;
    const showBottleStory=variantState.container === 'bottle' && variantState.pack === 'single';
    allSlides.slice(1).forEach(slide => {slide.hidden=!showBottleStory;});
    slides=allSlides.filter(slide => !slide.hidden);
    galleryControls.hidden=slides.length<2;
    gallery.setAttribute('aria-label',`${variant.name} product images`);
    rebuildDots();show(0);
  }
  document.querySelectorAll('[data-variant-container]').forEach(button => button.addEventListener('click',()=>{
    variantState.container=button.dataset.variantContainer;renderVariant();
  }));
  document.querySelectorAll('[data-variant-pack]').forEach(button => button.addEventListener('click',()=>{
    variantState.pack=button.dataset.variantPack;renderVariant();
  }));
  document.querySelectorAll('[data-gal]').forEach(button => button.addEventListener('click',() => show(current + (button.dataset.gal === 'next' ? 1 : -1))));
  gallery.addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    show(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  gallery.addEventListener('touchstart',event => {touch = event.touches.length === 1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null;}, {passive:true});
  gallery.addEventListener('touchend',event => {
    if (!touch || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX-touch.x, dy = event.changedTouches[0].clientY-touch.y;
    if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.5) show(current+(dx<0?1:-1));
    touch = null;
  }, {passive:true});
  gallery.addEventListener('touchcancel',() => {touch=null;}, {passive:true});
  renderVariant();

  const setChrome = () => {
    const height = ['.site-header','.site-announce'].reduce((sum,selector) => sum + ($(selector)?.offsetHeight || 0),0);
    document.documentElement.style.setProperty('--chrome-h',`${height}px`);
  };
  addEventListener('DOMContentLoaded',setChrome);
  addEventListener('resize',setChrome);
  setChrome();
})();
