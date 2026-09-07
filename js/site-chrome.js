(()=>{
  const star=`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#572010" d="M12 0l2.3 7.2L21 4.6l-4.4 6 7.4 1.4-7.4 1.4 4.4 6-6.7-2.6L12 24l-2.3-7.2L3 19.4l4.4-6L0 12l7.4-1.4-4.4-6 6.7 2.6z"/></svg>`;
  const chrome=`
  <div class="site-menu" id="shared-menu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
    <div class="menu-top"><span class="logo-star">${star}</span><button class="icon-btn" id="shared-menu-close" type="button" aria-label="Close menu"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
    <nav><a href="index.html#top" data-shared-menu-link>Home</a><a href="products.html" data-shared-menu-link>Products</a><a href="affiliate.html" data-shared-menu-link>Become an Affiliate</a><a href="story.html" data-shared-menu-link>Our Story</a></nav>
    <div class="menu-foot"><img src="assets/hopper-hero-184.webp" width="184" height="154" alt="Hopper, the David Craft Ale hop mascot"><span class="logo-star">${star}</span><a href="terms.html" data-shared-menu-link>Terms and conditions</a><a href="privacy.html" data-shared-menu-link>Cookies and Privacy Policy</a><span>Drink Responsibly</span></div>
  </div>
  <header class="site-header" id="top">
    <div class="hgroup"><button class="icon-btn" id="shared-menu-open" type="button" aria-label="Open menu"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><button class="icon-btn" type="button" aria-label="Search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg></button></div>
    <a href="index.html#top" class="logo-hopper" aria-label="David Craft Ale — home"><img src="assets/hopper-hero-184.webp" width="184" height="154" alt=""></a>
    <div class="hgroup right"><a class="icon-btn" href="account.html" aria-label="Account"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg></a><button class="icon-btn cart-button" type="button" aria-label="Cart"><svg viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.5a1.8 1.8 0 0 0 1.8 1.5h7.9a1.8 1.8 0 0 0 1.8-1.4L21 8H6"/></svg></button></div>
  </header><div class="site-announce">Free shipping on orders over $55</div>`;
  document.documentElement.classList.add('site-chrome-loaded');
  const legacy=document.querySelector('.page-head,.legal-header');
  legacy?.remove();
  /* steaua din footerul comun: pe index si products o stampeaza index.js /
     products.js prin [data-star]; paginile astea n-au scriptul acela, deci
     o punem aici, cu acelasi marcaj ca stelele din meniu. */
  document.querySelectorAll('[data-star]').forEach(el=>{
    if(!el.innerHTML.trim())el.innerHTML=star
  });
  const skip=document.querySelector('.skip,.skip-link');
  if(skip) skip.insertAdjacentHTML('afterend',chrome);
  else document.body.insertAdjacentHTML('afterbegin',chrome);
  const menu=document.querySelector('#shared-menu'),
        open=document.querySelector('#shared-menu-open'),
        close=document.querySelector('#shared-menu-close');
  let returnFocus=null;
  const syncLock=()=>{
    document.body.style.overflow=menu.classList.contains('is-open')?'hidden':''
  };
  const openMenu=()=>{
    returnFocus=document.activeElement;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden','false');
    syncLock();
    close.focus()
  };
  const closeMenu=()=>{
    if(!menu.classList.contains('is-open'))return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden','true');
    syncLock();
    returnFocus?.focus()
  };
  open.addEventListener('click',openMenu);
  close.addEventListener('click',closeMenu);
  menu.querySelectorAll('[data-shared-menu-link]').forEach(link=>link.addEventListener('click',()=>{
    menu.classList.remove('is-open');
    document.body.style.overflow=''
  }));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')closeMenu();
    if(event.key==='Tab'&&menu.classList.contains('is-open')){
      const focusable=[...menu.querySelectorAll('a,button')];
      const first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&document.activeElement===first){
        event.preventDefault();
        last.focus()
      } else if(!event.shiftKey&&document.activeElement===last){
        event.preventDefault();
        first.focus()
      }
    }
  });
})();
