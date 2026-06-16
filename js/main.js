/* FABLE·5 — orchestration.
   Preloader → hero intro → scroll scenes. One ticker, no surprises. */

import { initShader } from './shader.js';
import { initScroll } from './scroll.js';
import { initCursor } from './cursor.js';
import { buildHeroIntro, initScenes } from './scenes.js';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const seen = sessionStorage.getItem('fable5-seen') === '1';

const shaderApi = initShader({ reduced });
const lenis = reduced ? null : initScroll();
initCursor();

/* template gallery: keep the live iframe previews scaled to their card width */
const tviewports = document.querySelectorAll('.tcard__viewport');
function syncTemplateScales() {
  tviewports.forEach((v) => {
    if (v.clientWidth > 0) v.style.setProperty('--tscale', (v.clientWidth / 1280).toFixed(4));
  });
}
if (tviewports.length) {
  syncTemplateScales();
  addEventListener('resize', syncTemplateScales, { passive: true });
  addEventListener('load', syncTemplateScales);
}

const fontsReady = Promise.race([
  document.fonts.ready,
  new Promise((r) => setTimeout(r, 2200)),
]);

/* ---------- preloader ---------- */

const STATUS_LINES = [
  'warming up the model',
  'reading the 2026 web',
  'mixing oklch(89% 0.215 124)',
  'compiling 150 lines of glsl',
  'kerning the headline',
  'negotiating with the grid',
];

function runPreloader() {
  return new Promise((resolve) => {
    const counter = document.querySelector('[data-count]');
    const status = document.querySelector('[data-status]');
    const curtains = gsap.utils.toArray('.preloader__curtain span');

    lenis?.stop();

    let statusIdx = 0;
    const statusTimer = setInterval(() => {
      statusIdx = (statusIdx + 1) % STATUS_LINES.length;
      status.textContent = STATUS_LINES[statusIdx];
    }, 380);

    const n = { v: 0 };
    gsap.timeline({ onComplete: resolve })
      .to(n, {
        v: 100,
        duration: 1.9,
        ease: 'power2.inOut',
        onUpdate: () => { counter.textContent = String(Math.round(n.v)).padStart(2, '0'); },
      })
      .add(() => clearInterval(statusTimer))
      .to(['.preloader__count', '.preloader__status'], {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.in',
      }, '+=0.1')
      .to(curtains, {
        scaleY: 0,
        duration: 0.85,
        stagger: 0.07,
        ease: 'power4.inOut',
      }, '-=0.1');
  });
}

function dismissPreloaderInstantly() {
  const pre = document.querySelector('.preloader');
  if (pre) pre.remove();
}

/* ---------- boot ---------- */

async function boot() {
  if (!seen && !reduced) {
    // first visit: the story starts at the top, not at a restored offset
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }

  await fontsReady;

  const intro = buildHeroIntro({ reduced });
  initScenes({ shaderApi });

  if (reduced) {
    dismissPreloaderInstantly();
    document.body.removeAttribute('data-loading');
    return;
  }

  if (seen) {
    dismissPreloaderInstantly();
    document.body.removeAttribute('data-loading');
    lenis?.start();
    intro.timeScale(1.5).play();
  } else {
    await runPreloader();
    document.querySelector('.preloader')?.remove();
    document.body.removeAttribute('data-loading');
    sessionStorage.setItem('fable5-seen', '1');
    lenis?.start();
    intro.play();
  }

  if (document.readyState === 'complete') ScrollTrigger.refresh();
  else addEventListener('load', () => ScrollTrigger.refresh());
}

boot();
