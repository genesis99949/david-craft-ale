/* Load the interactive tour only near the viewport; keep the illustrated fallback on errors. */
(() => {
  const target = document.querySelector('[data-remotion-brewery]');
  if (!target) return;
  const load = () => import('./brewery-remotion.js?v=7').catch(error => {
    console.error('Brewery tour could not load', error);
  });
  if (!('IntersectionObserver' in window)) { load(); return; }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); }
  }, {rootMargin:'500px'});
  observer.observe(target);
})();
