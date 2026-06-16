/* Scroll choreography & interaction scenes.
   One reveal grammar, two easings, three durations — sitewide. */

const EASE = 'power4.out';

/* ---------- hero intro (played after the preloader) ---------- */

export function buildHeroIntro({ reduced }) {
  const nav = document.querySelector('.nav');
  const eyebrow = document.querySelector('.hero__eyebrow');
  const sub = document.querySelector('.hero__sub');
  const hint = document.querySelector('.hero__hint');
  const corner = document.querySelector('.hero__corner');
  const title = document.querySelector('.hero__title');

  if (reduced) return gsap.timeline({ paused: true });

  const eyebrowText = eyebrow.textContent;
  const lines = title.querySelectorAll('.line-inner');

  gsap.set([nav, sub, hint, corner], { autoAlpha: 0 });
  gsap.set(eyebrow, { autoAlpha: 0 });
  gsap.set(lines, { yPercent: 115 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });

  tl.add(() => {
      eyebrow.textContent = '';
      gsap.set(eyebrow, { autoAlpha: 1 });
    })
    .to(eyebrow, {
      duration: 1.3,
      scrambleText: { text: eyebrowText, chars: 'upperCase', speed: 0.4 },
      ease: 'none',
    }, 0)
    .to(lines, { yPercent: 0, duration: 1.35, stagger: 0.14 }, 0.15)
    .to(sub, { autoAlpha: 1, y: 0, duration: 1, startAt: { y: 26 } }, 0.85)
    .to(nav, { autoAlpha: 1, duration: 0.9 }, 1.0)
    .to([hint, corner], { autoAlpha: 1, duration: 0.9 }, 1.15);

  return tl;
}

/* ---------- everything scroll-driven ---------- */

export function initScenes({ shaderApi }) {
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: '(min-width: 881px)',
      mobile: '(max-width: 880px)',
      reduce: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { desktop, reduce } = ctx.conditions;

      /* --- reduced motion: a complete, static experience --- */
      if (reduce) {
        document.querySelectorAll('[data-count-to]').forEach((el) => {
          el.textContent = parseInt(el.dataset.countTo, 10).toLocaleString('en-US');
        });
        const statLines = document.querySelector('[data-stat-lines]');
        const linesTarget = document.querySelector('[data-count-to]')?.dataset.countTo ?? '0';
        if (statLines) statLines.textContent = parseInt(linesTarget, 10).toLocaleString('en-US');
        return;
      }

      /* --- hero exit: parallax + shader dim --- */
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate(self) {
          shaderApi?.setScroll(self.progress);
        },
      });
      gsap.to('.hero__content', {
        yPercent: -16,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '75% top', scrub: true },
      });
      gsap.to(['.hero__hint', '.hero__corner'], {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '25% top', scrub: true },
      });

      /* --- act titles: masked line reveals, the sitewide grammar --- */
      document.querySelectorAll('.split-lines').forEach((el) => {
        gsap.from(el.querySelectorAll('.line-inner'), {
          yPercent: 115,
          duration: 1.2,
          stagger: 0.12,
          ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        });
      });

      /* --- generic reveals --- */
      gsap.set('[data-reveal]', { y: 36, autoAlpha: 0 });
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 86%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1, ease: EASE }),
      });

      /* --- act I: weight scrubbed by scroll --- */
      gsap.fromTo(
        '.kinetic__line',
        { '--kinetic-wght': 200, xPercent: 3 },
        {
          '--kinetic-wght': 800,
          xPercent: -3,
          ease: 'none',
          scrollTrigger: { trigger: '.kinetic', start: 'top 90%', end: 'bottom 20%', scrub: 0.6 },
        }
      );

      /* --- act I: cursor-proximity weight --- */
      if (desktop && matchMedia('(pointer: fine)').matches) {
        const word = document.querySelector('[data-proximity]');
        const letters = [...word.querySelectorAll('.proximity__word span')];
        const state = letters.map(() => ({ cur: 200, target: 200 }));
        let rects = [];
        let active = false;

        const measure = () => {
          rects = letters.map((l) => {
            const r = l.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          });
        };

        ScrollTrigger.create({
          trigger: word,
          start: 'top bottom',
          end: 'bottom top',
          onToggle(self) {
            active = self.isActive;
            if (active) measure();
          },
          onRefresh: measure,
        });

        addEventListener('pointermove', (e) => {
          if (!active) return;
          rects.forEach((r, i) => {
            const d = Math.hypot(e.clientX - r.x, e.clientY - r.y);
            const k = Math.max(0, 1 - d / 320);
            state[i].target = 200 + 580 * k * k;
          });
        }, { passive: true });

        gsap.ticker.add(() => {
          if (!active) return;
          state.forEach((s, i) => {
            s.cur += (s.target - s.cur) * 0.14;
            letters[i].style.fontVariationSettings = `"opsz" 96, "wdth" 80, "wght" ${s.cur.toFixed(1)}`;
            letters[i].style.color = s.cur > 520 ? 'var(--accent)' : '';
          });
        });
      }

      /* --- act II: horizontal pin (desktop only) --- */
      if (desktop) {
        const track = document.querySelector('.motion__track');
        gsap.to(track, {
          x: () => -(track.scrollWidth - innerWidth + 32),
          ease: 'none',
          scrollTrigger: {
            trigger: '.act-motion',
            start: 'top top',
            end: () => '+=' + (track.scrollWidth - innerWidth + 600),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      /* --- act II: FPS meter, measured honestly --- */
      const fpsEl = document.querySelector('[data-fps]');
      if (fpsEl) {
        let frames = 0;
        let last = performance.now();
        let fpsActive = false;
        ScrollTrigger.create({
          trigger: '.mcard--fps',
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => { fpsActive = self.isActive; },
        });
        gsap.ticker.add(() => {
          if (!fpsActive) return;
          frames++;
          const now = performance.now();
          if (now - last >= 500) {
            fpsEl.textContent = Math.min(Math.round((frames * 1000) / (now - last)), 120);
            frames = 0;
            last = now;
          }
        });
      }

      /* --- act II: scramble-on-hover --- */
      document.querySelectorAll('[data-scramble-hover]').forEach((el) => {
        el.addEventListener('pointerenter', () => {
          gsap.to(el, {
            duration: 0.9,
            scrambleText: { text: el.dataset.text, chars: '▮▯/\\|<>#01', speed: 0.35 },
            ease: 'none',
          });
        });
      });

      /* --- act II: spring drop --- */
      const springStage = document.querySelector('.spring-stage');
      if (springStage) {
        ScrollTrigger.create({
          trigger: springStage,
          start: 'top 80%',
          once: true,
          onEnter: () => springStage.classList.add('is-dropped'),
        });
        document.querySelector('[data-spring-replay]')?.addEventListener('click', () => {
          springStage.classList.remove('is-dropped');
          void springStage.offsetWidth; // restart the transition
          springStage.classList.add('is-dropped');
        });
      }

      /* --- act II: tilt card --- */
      const tilt = document.querySelector('[data-tilt]');
      if (tilt && matchMedia('(pointer: fine)').matches) {
        const inner = tilt.querySelector('.tilt__inner');
        const rx = gsap.quickTo(inner, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        const ry = gsap.quickTo(inner, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        tilt.addEventListener('pointermove', (e) => {
          const r = tilt.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          rx(-ny * 12);
          ry(nx * 12);
          inner.style.setProperty('--glare-x', `${nx * 60}%`);
          inner.style.setProperty('--glare-y', `${ny * 60}%`);
        });
        tilt.addEventListener('pointerleave', () => { rx(0); ry(0); });
      }

      /* --- act IV: terminal log --- */
      const tlines = gsap.utils.toArray('[data-tline]');
      gsap.set(tlines, { autoAlpha: 0, x: -10 });
      ScrollTrigger.create({
        trigger: '.terminal',
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(tlines, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.14, ease: 'power2.out' });
          const statEl = document.querySelector('[data-stat-lines]');
          if (statEl) {
            const target = parseInt(document.querySelector('[data-count-to]')?.dataset.countTo ?? '2900', 10);
            const obj = { v: 0 };
            gsap.to(obj, {
              v: target,
              duration: 1.6,
              delay: 0.8,
              ease: 'power2.out',
              onUpdate: () => { statEl.textContent = Math.round(obj.v).toLocaleString('en-US'); },
            });
          }
        },
      });

      /* --- act IV: count-up stats --- */
      document.querySelectorAll('[data-count-to]').forEach((el) => {
        const target = parseInt(el.dataset.countTo, 10);
        const obj = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () =>
            gsap.to(obj, {
              v: target,
              duration: 1.8,
              ease: 'power3.out',
              onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('en-US'); },
            }),
        });
      });

      /* --- finale: velocity-reactive marquee --- */
      const marquee = document.querySelector('[data-marquee]');
      if (marquee) {
        const roll = gsap.to(marquee, { xPercent: -50, repeat: -1, duration: 26, ease: 'none' });
        let boost = 1;
        ScrollTrigger.create({
          onUpdate(self) {
            boost = 1 + Math.min(Math.abs(self.getVelocity()) / 900, 4);
          },
        });
        gsap.ticker.add(() => {
          roll.timeScale(gsap.utils.interpolate(roll.timeScale(), boost, 0.08));
          boost += (1 - boost) * 0.05;
        });
      }
    }
  );
}
