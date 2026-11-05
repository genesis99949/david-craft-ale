(()=>{
 const targets=[...document.querySelectorAll('[data-journey-motion]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let modulePromise;
 const load=target=>{
  if(reduced.matches)return;
  modulePromise ||= import('./journey-motion.js?v=1');
  modulePromise.then(module=>module.mountScene(target)).catch(console.error);
 };
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting)load(entry.target);});
 },{rootMargin:'300px'}):null;
 targets.forEach(target=>observer?observer.observe(target):load(target));
 reduced.addEventListener('change',()=>{if(!reduced.matches)targets.forEach(target=>{
  const box=target.getBoundingClientRect();if(box.top<innerHeight+300&&box.bottom>-300)load(target);
 });});
})();
