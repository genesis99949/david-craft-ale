(() => {
  'use strict';
  const frames = [...document.querySelectorAll('[data-story-reveal]')];
  if (!frames.length || typeof Element.prototype.animate !== 'function') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const states = new Map();

  function finish(frame) {
    const state = states.get(frame);
    if (!state) return;
    clearTimeout(state.timer);
    state.image?.removeEventListener('load', state.loaded);
    state.image?.removeEventListener('error', state.loaded);
    state.animations.forEach(animation => animation.cancel());
    state.curtain?.remove();
    frame.dataset.revealState = 'done';
    state.done = true;
    pending.delete(frame);
  }

  function reveal(frame) {
    const state = states.get(frame);
    if (!state || state.done || state.running) return;
    if (reduced.matches) { finish(frame); return; }
    state.running = true;
    clearTimeout(state.timer);
    const animate = (element, keyframes, options) => {
      const animation = element.animate(keyframes, {duration:1100, easing:ease, fill:'both', ...options});
      state.animations.push(animation);
      return animation;
    };
    try {
      if (frame.dataset.storyReveal === 'iris') {
        animate(frame, [{clipPath:'inset(50% round 24px)'}, {clipPath:'inset(0% round 24px)'}]);
      } else {
        [...state.curtain.children].forEach((layer, i) => {
          animate(layer, [{transform:'translateY(0%)'}, {transform:'translateY(-105%)'}], {duration:1000,delay:(2-i)*100});
        });
      }
      if (state.image) animate(state.image, [{transform:'scale(1.18)'}, {transform:'scale(1)'}], {duration:1400});
      frame.dataset.revealState = 'running';
      Promise.all(state.animations.map(animation => animation.finished)).then(() => finish(frame), () => finish(frame));
      // A browser interruption must never leave a photograph covered.
      state.timer = setTimeout(() => finish(frame), 2200);
    } catch (_) { finish(frame); }
  }

  // Geometry, not IntersectionObserver: a frame clipped to nothing by its own
  // pending clip-path is reported as never intersecting, so it would never open.
  const pending = new Set();
  function arrive(frame) {
    const state = states.get(frame);
    if (!state || state.done || state.waiting) return;
    if (state.image && !state.image.complete) {
      state.waiting = true;
      state.loaded = () => reveal(frame);
      state.image.addEventListener('load', state.loaded, {once:true});
      state.image.addEventListener('error', state.loaded, {once:true});
      state.timer = setTimeout(state.loaded, 1500);
    } else reveal(frame);
  }

  let queued = false;
  function check() {
    queued = false;
    const line = innerHeight * 0.88;
    pending.forEach(frame => {
      const rect = frame.getBoundingClientRect();
      if (rect.top < line && rect.bottom > 0) { pending.delete(frame); arrive(frame); }
    });
  }
  function queue() { if (!queued && pending.size) { queued = true; requestAnimationFrame(check); } }

  frames.forEach(frame => {
    const state = {image:frame.querySelector('img'),animations:[],done:false,running:false};
    states.set(frame,state);
    if (reduced.matches) { finish(frame); return; }
    if (frame.dataset.storyReveal === 'curtain') {
      state.curtain = document.createElement('span');
      state.curtain.className = 'story-image-curtain';
      state.curtain.setAttribute('aria-hidden','true');
      for (let i=0;i<3;i++) state.curtain.appendChild(document.createElement('span'));
      frame.appendChild(state.curtain);
    }
    frame.dataset.revealState = 'pending';
    pending.add(frame);
  });

  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', queue);
  addEventListener('load', queue);
  queue();
  reduced.addEventListener('change', () => { if (reduced.matches) frames.forEach(finish); });
  window.addEventListener('pageshow', event => { if (event.persisted) frames.forEach(finish); });
})();
