/* js/story.js
   Extras din story.html. Comportament neschimbat: fisierul e incarcat
   in exact aceeasi pozitie in document ca blocul inline de dinainte. */
/* Header tint — the bar adopts the colour of the band it is crossing.
     Colours are read off the DOM rather than hardcoded, so changing a
     story-band--* class on a section moves the header with it. */
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const bands = [
      ...document.querySelectorAll('main > section'),
      document.querySelector('.story-footer')
    ].filter(Boolean);

    /* A section states its colour either on itself (story-band--cream),
       on its copy column (the split layouts), or as a plain background
       (the footer). Anything with none of those — the hero — stays
       transparent so the photograph reads through. */
    const toneOf = (el) => {
      const band = el.matches('[class*="story-band--"]')
        ? el
        : el.querySelector('[class*="story-band--"]');
      const cs = getComputedStyle(band || el);
      const bg = cs.backgroundColor;
      if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return null;
      /* icon hover tint is derived from the text colour so it stays visible
         in both directions — dark wash on cream, light wash on cocoa.
         (color-mix with currentColor resolves to fully transparent here.) */
      const ch = cs.color.match(/[\d.]+/g);
      const hover = ch && ch.length >= 3 ? `rgba(${ch[0]}, ${ch[1]}, ${ch[2]}, .14)` : null;
      return { bg, fg: cs.color, hover };
    };

    const tones = bands.map(el => ({ el, tone: toneOf(el) }));
    let queued = false, current;

    const apply = () => {
      queued = false;
      /* measured at the bar's midline, so the swap lands as the boundary
         passes through it rather than at either edge */
      const probe = header.getBoundingClientRect().height / 2;
      const hit = tones.find(t => {
        const r = t.el.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      });
      const tone = hit ? hit.tone : null;
      const key = tone ? tone.bg : 'hero';
      if (key === current) return;
      current = key;
      if (tone) {
        header.style.setProperty('--chrome-bg', tone.bg);
        header.style.setProperty('--chrome-fg', tone.fg);
        if (tone.hover) header.style.setProperty('--chrome-hover', tone.hover);
        header.dataset.chrome = 'band';
      } else {
        header.style.removeProperty('--chrome-bg');
        header.style.removeProperty('--chrome-fg');
        header.style.removeProperty('--chrome-hover');
        header.dataset.chrome = 'hero';
      }
    };

    const request = () => { if (!queued) { queued = true; requestAnimationFrame(apply); } };
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request, { passive: true });
    apply();
  });
