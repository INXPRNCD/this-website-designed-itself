/* Lenis smooth scroll, synced into GSAP's single ticker.
   One rAF loop owns the whole site. */

export function initScroll() {
  const lenis = new Lenis({
    duration: 1.15,
    anchors: true,
    autoRaf: false, // GSAP's ticker is the only rAF loop on this page
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
