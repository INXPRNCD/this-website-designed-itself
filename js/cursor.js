/* Custom cursor (difference blend) + magnetic elements.
   Fine pointers only — touch users never see any of this. */

export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return;

  const el = document.querySelector('.cursor');
  if (!el) return;

  gsap.set(el, { x: -100, y: -100 }); // offscreen until the pointer speaks

  const xTo = gsap.quickTo(el, 'x', { duration: 0.32, ease: 'power3.out' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.32, ease: 'power3.out' });

  addEventListener('pointermove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  }, { passive: true });

  // grow over anything interactive
  const HOVERABLE = 'a, button, summary, [data-magnetic]';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(HOVERABLE)) gsap.to(el, { scale: 3.2, duration: 0.35, ease: 'power3.out' });
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(HOVERABLE)) gsap.to(el, { scale: 1, duration: 0.35, ease: 'power3.out' });
  });

  // magnetic pull — the element leans toward the cursor inside its zone
  document.querySelectorAll('[data-magnet-zone]').forEach((zone) => {
    const target = zone.querySelector('[data-magnet]');
    if (!target) return;
    const mx = gsap.quickTo(target, 'x', { duration: 0.45, ease: 'power3.out' });
    const my = gsap.quickTo(target, 'y', { duration: 0.45, ease: 'power3.out' });

    zone.addEventListener('pointermove', (e) => {
      const r = zone.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.38);
      my((e.clientY - (r.top + r.height / 2)) * 0.38);
    });
    zone.addEventListener('pointerleave', () => {
      gsap.to(target, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
    });
  });

  // subtle magnetism on small chrome elements
  document.querySelectorAll('[data-magnetic]').forEach((item) => {
    const ix = gsap.quickTo(item, 'x', { duration: 0.4, ease: 'power3.out' });
    const iy = gsap.quickTo(item, 'y', { duration: 0.4, ease: 'power3.out' });
    item.addEventListener('pointermove', (e) => {
      const r = item.getBoundingClientRect();
      ix((e.clientX - (r.left + r.width / 2)) * 0.25);
      iy((e.clientY - (r.top + r.height / 2)) * 0.25);
    });
    item.addEventListener('pointerleave', () => {
      gsap.to(item, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    });
  });
}
