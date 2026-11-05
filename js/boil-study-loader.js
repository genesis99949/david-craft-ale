(()=>{
 const el=document.querySelector('[data-boil-study]');
 if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const load=()=>import('./boil-study.js?v=2').catch(console.error);
 if(!('IntersectionObserver' in window)){load();return;}
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:'400px'});
 observer.observe(el);
})();
