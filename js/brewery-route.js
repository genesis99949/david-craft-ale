/* Image-to-image connectors whose progress is controlled entirely by scroll. */
(() => {
  const list = document.querySelector('.brew-journey');
  if (!list) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 700px)');
  const steps = [...list.querySelectorAll('.brew-journey__step')];
  const routes = steps.slice(0, -1).map((step, index) => {
    const svg = step.querySelector('.brew-journey__link');
    const line = svg.querySelector('path');
    const arrow = svg.querySelector('.brew-journey__arrow');
    svg.classList.add('brew-journey__link--measured');
    arrow.setAttribute('d', 'M-7 -11 L0 0 L7 -11');
    return {step, next: steps[index + 1], svg, line, arrow};
  });
  let dirty = true;
  let queued = false;
  function measure() {
    for (const route of routes) {
      const {step, next, svg, line} = route;
      const box = step.getBoundingClientRect();
      const imageBox = item => {
        const figure = item.querySelector('.brew-journey__art');
        return (figure.querySelector('img') || figure).getBoundingClientRect();
      };
      const art = imageBox(step);
      const nextArt = imageBox(next);
      const x1 = art.left + art.width / 2 - box.left;
      const x2 = nextArt.left + nextArt.width / 2 - box.left;
      const start = art.bottom - 4;
      const end = nextArt.top + 4;
      const height = Math.max(30, end - start);
      svg.setAttribute('viewBox', `0 0 ${box.width} ${height}`);
      Object.assign(svg.style, {left:'0px',top:`${start-box.top}px`,bottom:'auto',width:`${box.width}px`,height:`${height}px`});
      // On phones, travel around the copy in the left gutter, not through it.
      const gutter = -8;
      const d = narrow.matches
        ? `M${x1} 0 C${x1} 18 ${gutter} 4 ${gutter} 24 L${gutter} ${height-70} C${gutter} ${height-26} ${x2} ${height-52} ${x2} ${height}`
        : `M${x1} 0 C${x1} ${height*.7} ${x2} ${height*.3} ${x2} ${height}`;
      line.setAttribute('d', d);
      route.length = line.getTotalLength();
      line.style.strokeDasharray = `${route.length} ${route.length}`;
    }
    dirty = false;
  }
  function draw() {
    queued = false;
    if (dirty) measure();
    for (const route of routes) {
      const {svg,line,arrow,length}=route;
      const bounds = svg.getBoundingClientRect();
      // Spread the reveal across the gap plus part of the viewport to avoid
      // rushing through the short desktop connectors. No time-based playback.
      const p=reduced.matches?1:Math.max(0,Math.min(1,
        (innerHeight*.85-bounds.top)/(bounds.height+innerHeight*.3)));
      const progress=p*p*(3-2*p);
      const distance=length*progress;
      line.style.strokeDashoffset=String(length-distance);
      const point=line.getPointAtLength(distance);
      const before=line.getPointAtLength(Math.max(0,distance-1));
      const after=line.getPointAtLength(Math.min(length,distance+1));
      const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI-90;
      arrow.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${angle})`);
      arrow.style.opacity=progress>.015?'1':'0';
    }
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(draw);}}
  function resize(){dirty=true;schedule();}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',schedule);
  if('ResizeObserver' in window){
    const observer=new ResizeObserver(resize);
    steps.forEach(step=>observer.observe(step));
  }
  document.fonts?.ready.then(resize);
  list.querySelectorAll('img').forEach(img=>img.addEventListener('load',resize,{once:true}));
  schedule();
})();
