(() => {
  const stage = document.querySelector('.story-split--hopper .story-split__copy');
  if (!stage) return;
  const couriers = [...stage.querySelectorAll('.story-crate-hopper')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const random = (min, max) => min + Math.random() * (max - min);
  const flights = couriers.map(el => ({el, active: false, wait: random(.3, 4)}));
  let width = 0, height = 0, size = 0;
  let raf = 0, previous = 0, visible = false;

  function hide(flight) {
    flight.active = false;
    flight.wait = random(2.5, 9);
    flight.el.style.opacity = '0';
  }

  function measure() {
    const w = stage.clientWidth, h = stage.clientHeight;
    const s = couriers[0]?.offsetWidth || 88;
    if (w === width && h === height && s === size) return;
    width = w; height = h; size = s;
    // Keep all territories inside the text panel. Stack them in narrow panels
    // so each character retains enough room to travel horizontally.
    flights.forEach((flight, i) => {
      const vertical = width <= 820;
      const gap = 16, edge = size * .15 + 8;
      const slice = (vertical ? height : width) / flights.length;
      flight.zone = vertical
        ? {left: edge, right: width - size - edge, top: i * slice + gap, bottom: (i + 1) * slice - size - gap}
        : {left: i * slice + gap, right: (i + 1) * slice - size - gap, top: edge, bottom: height - size - edge};
      hide(flight);
      flight.wait = random(.3, 4);
    });
  }

  function tooClose(flight, x, y, spawning = false) {
    return flights.some(other => other !== flight && other.active && (
      Math.hypot(x - other.x, y - other.y) < size * 1.35 ||
      (spawning && Math.abs(x - other.x) < size * .85)
    ));
  }

  function spawn(flight) {
    const z = flight.zone;
    if (!z || z.right <= z.left || z.bottom <= z.top) return;
    for (let attempt = 0; attempt < 12; attempt++) {
      const x = random(z.left, z.right), y = random(z.top, z.bottom);
      if (tooClose(flight, x, y, true)) continue;
      Object.assign(flight, {x, y, active: true, age: 0, duration: random(7, 16),
        angle: random(-Math.PI, Math.PI), turn: 0, targetTurn: random(-.7, .7),
        nextTurn: random(.8, 2.4), speed: random(20, 38), facing: 1});
      return;
    }
    flight.wait = random(.8, 2);
  }

  function update(flight, dt) {
    if (!flight.active) {
      flight.wait -= dt;
      if (flight.wait <= 0) spawn(flight);
      if (!flight.active) return;
    }
    flight.age += dt;
    flight.nextTurn -= dt;
    if (flight.nextTurn <= 0) {
      flight.targetTurn = random(-.9, .9);
      flight.nextTurn = random(.8, 2.8);
    }
    flight.turn += (flight.targetTurn - flight.turn) * Math.min(1, dt * 2);
    flight.angle += flight.turn * dt;
    const dx = Math.cos(flight.angle), dy = Math.sin(flight.angle);
    const x = flight.x + dx * flight.speed * dt;
    const y = flight.y + dy * flight.speed * dt;
    const z = flight.zone;
    if (x < z.left || x > z.right || y < z.top || y > z.bottom ||
        flight.age >= flight.duration || tooClose(flight, x, y)) {
      hide(flight);
      return;
    }
    flight.x = x; flight.y = y;
    const edge = Math.min(x - z.left, z.right - x, y - z.top, z.bottom - y);
    const opacity = Math.max(0, Math.min(1, flight.age / .65,
      (flight.duration - flight.age) / .8, edge / 18));
    flight.el.style.opacity = opacity.toFixed(3);
    flight.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${(dy * 9).toFixed(2)}deg)`;
    if (Math.abs(dx) > .15) flight.facing = dx > 0 ? 1 : -1;
    flight.el.firstElementChild.style.transform = `scaleX(${flight.facing})`;
  }

  function frame(now) {
    const dt = previous ? Math.min(now - previous, 50) / 1000 : 0;
    previous = now;
    flights.forEach(flight => update(flight, dt));
    raf = requestAnimationFrame(frame);
  }

  function sync() {
    cancelAnimationFrame(raf);
    raf = 0; previous = 0;
    const running = visible && !document.hidden && !reduced.matches;
    stage.classList.toggle('is-flying', running);
    stage.classList.toggle('has-flight-paths', !reduced.matches);
    if (reduced.matches) {
      flights.forEach(flight => {
        hide(flight);
        flight.el.style.removeProperty('opacity');
        flight.el.style.removeProperty('transform');
        flight.el.firstElementChild.style.removeProperty('transform');
      });
    } else {
      measure();
      if (running) raf = requestAnimationFrame(frame);
    }
  }

  new ResizeObserver(measure).observe(stage);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, {rootMargin: '80px'}).observe(stage);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  measure();
  sync();
})();
