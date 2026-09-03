(() => {
  const stage = document.querySelector('.story-split--hopper .story-split__copy');
  if (!stage) return;
  const couriers = [...stage.querySelectorAll('.story-crate-hopper')];
  const content = [...stage.children].filter(el => !el.classList.contains('story-crate-hopper'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const random = (min, max) => min + Math.random() * (max - min);
  const flights = couriers.map(el => ({el, active: false, wait: 0}));
  let layout = '', size = 88, raf = 0, previous = 0, visible = false;

  function hide(flight) {
    flight.active = false;
    flight.wait = random(2, 5);
    flight.el.style.opacity = '0';
  }

  function destination(flight) {
    const z = flight.zone;
    flight.fromX = flight.x;
    flight.fromY = flight.y;
    flight.toX = random(z.left + 12, z.right - 12);
    flight.toY = random(z.top + 12, z.bottom - 12);
    flight.travel = 0;
    flight.travelDuration = random(4, 7);
  }

  function spawn(flight, immediate = false) {
    const z = flight.zone;
    if (!z || z.right <= z.left + 24 || z.bottom <= z.top + 24) return;
    // Start at alternating sides of the text, already visible on first arrival.
    const index = flights.indexOf(flight);
    flight.x = immediate ? (index === 0 ? z.left + 16 : index === 1 ? z.right - 16 : (z.left + z.right) / 2) : random(z.left + 16, z.right - 16);
    flight.y = random(z.top + 16, z.bottom - 16);
    flight.age = immediate ? 1 : 0;
    flight.duration = random(30, 48);
    flight.active = true;
    flight.facing = index % 2 ? -1 : 1;
    destination(flight);
    render(flight, 0);
  }

  function measure() {
    const width = stage.clientWidth, height = stage.clientHeight;
    size = couriers[0]?.offsetWidth || 88;
    const first = content[0], last = content[content.length - 1];
    const top = Math.max(16, (first?.offsetTop || 48) - size * .6);
    const bottom = Math.min(height - 16, last ? last.offsetTop + last.offsetHeight + size * .6 : height - 48);
    const nextLayout = [width, height, size, top, bottom].join(':');
    if (nextLayout === layout) return;
    layout = nextLayout;
    // Anchor the three territories to the actual text, rather than the panel's
    // empty padding. The gap also accommodates the sprite's slight rotation.
    const slice = (bottom - top) / flights.length, gap = size * .2;
    flights.forEach((flight, i) => {
      flight.zone = {left: 16, right: width - size - 16,
        top: top + i * slice + gap, bottom: top + (i + 1) * slice - size - gap};
      hide(flight);
      if (!reduced.matches) spawn(flight, true);
    });
  }

  function render(flight, bank) {
    const z = flight.zone;
    const edge = Math.min(flight.x - z.left, z.right - flight.x, flight.y - z.top, z.bottom - flight.y);
    flight.el.style.opacity = Math.max(0, Math.min(1, flight.age / .65, edge / 12)).toFixed(3);
    flight.el.style.transform = `translate3d(${flight.x.toFixed(2)}px,${flight.y.toFixed(2)}px,0) rotate(${bank.toFixed(2)}deg)`;
    flight.el.firstElementChild.style.transform = `scaleX(${flight.facing})`;
  }

  function update(flight, dt) {
    if (!flight.active) {
      flight.wait -= dt;
      if (flight.wait <= 0) spawn(flight);
      return;
    }
    flight.age += dt;
    if (flight.age >= flight.duration) {
      // After a long stay, leave through the nearest side and fade at its edge.
      const z = flight.zone;
      const direction = flight.x < (z.left + z.right) / 2 ? -1 : 1;
      flight.x += direction * 32 * dt;
      flight.facing = direction;
      if (flight.x < z.left || flight.x > z.right) { hide(flight); return; }
      render(flight, direction * 5);
      return;
    }
    flight.travel += dt;
    const t = Math.min(1, flight.travel / flight.travelDuration);
    const eased = t * t * (3 - 2 * t);
    flight.x = flight.fromX + (flight.toX - flight.fromX) * eased;
    flight.y = flight.fromY + (flight.toY - flight.fromY) * eased;
    if (Math.abs(flight.toX - flight.fromX) > 4) flight.facing = flight.toX > flight.fromX ? 1 : -1;
    render(flight, Math.sin(t * Math.PI) * (flight.toY > flight.fromY ? 7 : -7));
    if (t >= 1) destination(flight);
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
      if (running) {
        // Returning to this section should never start with an empty panel.
        flights.forEach(flight => { if (!flight.active) spawn(flight, true); });
        raf = requestAnimationFrame(frame);
      }
    }
  }

  const observer = new ResizeObserver(measure);
  observer.observe(stage);
  content.forEach(el => observer.observe(el));
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(stage);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  measure();
  sync();
})();
