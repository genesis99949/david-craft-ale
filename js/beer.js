(() => {
  'use strict';
  const brews = {
  "blonde": {
    "name": "Blonde Ale",
    "title": "Blonde<br>Ale",
    "image": "assets/bottle-blonde.png",
    "accent": "#a87409",
    "wash": "#ffc24b",
    "lead": "Light, crisp and quietly sunnyâ€”the easy-going member of the David Craft Ale family.",
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
    "price": "3.99"
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
    "price": "3.99"
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
    "price": "3.99"
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
    "price": "3.99"
  }
};
  const requested = new URLSearchParams(location.search).get('brew');
  const key = Object.hasOwn(brews, requested) ? requested : 'blonde';
  const brew = brews[key];
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
    photo.src = `assets/beer-gallery/${key}-${view}-800.webp`;
    photo.srcset = [480,800,1536].map(width => `assets/beer-gallery/${key}-${view}-${width}.webp ${width}w`).join(', ');
    photo.alt = view === 'back' ? `${brew.name} bottle viewed from the back` : `${brew.name} bottle and glass on a wooden table`;
  });
  $('#brew-glass').src = `assets/glass-${key}.png`; $('#brew-glass').alt = `${brew.name} poured into a glass`;
  $('#brew-detail').src = brew.image; $('#brew-detail').alt = `Close-up of the ${brew.name} label and Hopper illustration`;
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
    window.DCB?.cart.add({slug:brew.slug,name:`${brew.name} Bottle`,price:brew.price,currency:'USD',package:'Individual bottle beer',image:brew.image});
    window.DCB?.cart.open();
  });

  // Match Hopper's gallery: arrows, direct selection, keyboard and touch.
  const gallery = $('#beer-gallery'), slides = [...gallery.querySelectorAll('figure')], dots = $('.hp-dots');
  gallery.setAttribute('aria-label',`${brew.name} product images`);
  let current = 0, touch = null;
  function show(next) {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide,index) => {
      slide.toggleAttribute('data-active',index === current);
      slide.setAttribute('aria-hidden',String(index !== current));
    });
    [...dots.children].forEach((dot,index) => dot.setAttribute('aria-current',String(index === current)));
    const caption = slides[current].querySelector('figcaption').textContent;
    set('#gallery-status',`Image ${current + 1} of ${slides.length}: ${caption}`);
  }
  slides.forEach((slide,index) => {
    const dot = document.createElement('button');
    dot.type = 'button';dot.setAttribute('aria-label',`Show ${slide.querySelector('figcaption').textContent.toLowerCase()}`);
    dot.addEventListener('click',() => show(index));dots.appendChild(dot);
  });
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
  show(0);

  const setChrome = () => {
    const height = ['.site-header','.site-announce'].reduce((sum,selector) => sum + ($(selector)?.offsetHeight || 0),0);
    document.documentElement.style.setProperty('--chrome-h',`${height}px`);
  };
  addEventListener('DOMContentLoaded',setChrome);
  addEventListener('resize',setChrome);
  setChrome();
})();
