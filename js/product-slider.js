/* Native scrolling keeps touch, trackpads and keyboard focus usable without JS. */
(() => {
  document.querySelectorAll('[data-product-slider]').forEach(section => {
    const track = section.querySelector('.bp-slider');
    const slides = [...track.querySelectorAll('.bp-slider-card')];
    const controls = section.querySelector('.bp-slider-controls');
    const dots = section.querySelector('.bp-slider-dots');
    const prev = section.querySelector('[data-slider-prev]');
    const next = section.querySelector('[data-slider-next]');
    const status = section.querySelector('[data-slider-status]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!slides.length) return;
    // Extra edge cards keep three whole products and two previews visible at every desktop stop.
    const edgeCount = Math.min(3, slides.length);
    function duplicate(slide) {
      const copy = slide.cloneNode(true);
      copy.setAttribute('aria-hidden','true');
      copy.setAttribute('tabindex','-1');
      return copy;
    }
    track.prepend(...slides.slice(-edgeCount).map(duplicate));
    track.append(...slides.slice(0,edgeCount).map(duplicate));
    const rendered = [...track.querySelectorAll('.bp-slider-card')];
    const wrap = index => (index % slides.length + slides.length) % slides.length;
    let positions = [], current = slides.length > 2 ? 1 : 0, nearest = edgeCount + current;
    let queued = false, drag = null, suppressClick = false, settleTimer;

    function clearDragClick() {
      suppressClick=false;
      rendered.forEach(slide=>slide.removeAttribute('data-no-pour'));
    }

    function sync() {
      queued = false;
      nearest = positions.reduce((best, position, index) => Math.abs(position-track.scrollLeft) < Math.abs(positions[best]-track.scrollLeft) ? index : best,0);
      current = wrap(nearest-edgeCount);
      prev.disabled = next.disabled = slides.length < 2;
      [...dots.children].forEach((dot,index) => dot.setAttribute('aria-current',String(index===current)));
      const activeDot=dots.children[current];
      if(activeDot && dots.scrollWidth>dots.clientWidth) dots.scrollLeft=activeDot.offsetLeft-(dots.clientWidth-activeDot.offsetWidth)/2;
      status.textContent = `Product ${current+1} of ${slides.length}: ${slides[current].querySelector('h3').textContent}`;
    }

    function measure() {
      positions = rendered.map(slide => slide.offsetLeft + slide.offsetWidth/2 - track.clientWidth/2);
      track.scrollTo({left:positions[edgeCount+current],behavior:'instant'});
      dots.replaceChildren();
      slides.forEach((slide,index) => {
        const dot = document.createElement('button');dot.type='button';
        dot.setAttribute('aria-label',`Go to carousel position ${index+1}`);
        dot.setAttribute('aria-controls',track.id);
        dot.addEventListener('click',()=>go(index));dots.appendChild(dot);
      });
      controls.hidden = slides.length<2;
      track.setAttribute('data-slider-ready','');
      sync();
    }

    function go(index) {
      if(nearest < edgeCount || nearest >= edgeCount+slides.length) {
        track.scrollTo({left:positions[edgeCount+current],behavior:'instant'});
      }
      // Neighbour arrows may land on an edge copy; settle silently returns to its original.
      const target = index < 0 ? edgeCount-1 : index >= slides.length ? edgeCount+slides.length : edgeCount+index;
      track.scrollTo({left:positions[target],behavior:reduced.matches?'instant':'smooth'});
    }
    function settle() {
      if(drag) return;
      sync();
      if(nearest < edgeCount || nearest >= edgeCount+slides.length) {
        track.scrollTo({left:positions[edgeCount+current],behavior:'instant'});
      }
    }
    prev.addEventListener('click',()=>go(current-1));
    next.addEventListener('click',()=>go(current+1));
    track.addEventListener('scroll',()=>{
      if(!queued){queued=true;requestAnimationFrame(sync);}
      clearTimeout(settleTimer);settleTimer=setTimeout(settle,180);
    },{passive:true});
    track.addEventListener('scrollend',settle);
    track.addEventListener('keydown',event=>{
      if(event.key==='Enter')clearDragClick();
      if(event.target!==track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      go(event.key==='Home'?0:event.key==='End'?slides.length-1:current+(event.key==='ArrowRight'?1:-1));
    });
    // Mouse dragging, while touch keeps the browser's native momentum and snap.
    track.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='mouse'||event.button!==0)return;
      clearDragClick();drag={id:event.pointerId,x:event.clientX,left:track.scrollLeft,moved:false};
    });
    track.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      const dx=event.clientX-drag.x;
      if(!drag.moved && Math.abs(dx)<8)return;
      if(!drag.moved){
        drag.moved=true;track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');
        // The shared page transition listens at document capture phase.
        // Exclude a drag-generated click before it reaches that listener.
        rendered.forEach(slide=>slide.setAttribute('data-no-pour',''));
      }
      event.preventDefault();track.scrollLeft=drag.left-dx;
    });
    function endDrag(){
      if(!drag)return;
      const {id,moved}=drag;drag=null;
      if(track.hasPointerCapture(id))track.releasePointerCapture(id);
      track.classList.remove('is-dragging');
      if(moved){suppressClick=true;sync();track.scrollTo({left:positions[nearest],behavior:reduced.matches?'instant':'smooth'});}
    }
    track.addEventListener('pointerup',endDrag);
    track.addEventListener('pointercancel',endDrag);
    track.addEventListener('lostpointercapture',endDrag);
    track.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)drag=null;});
    track.addEventListener('dragstart',event=>event.preventDefault());
    track.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();clearDragClick();}},true);
    if('ResizeObserver' in window){new ResizeObserver(measure).observe(track);}else window.addEventListener('resize',measure);
    measure();
  });
})();
