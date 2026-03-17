/**
 * main.js — Web It Up Orchestrator
 * Imports all animation modules and initializes the website
 */
import './style.css';
import { initSmoothScroll, getScrollContainer, getLocoScroll } from './animations/scroll.js';
import { animatePreloader, animateHero, initHeroCanvas, initScrollAnimations, initCounters, initDoodleParallax } from './animations/gsap.js';
import { initCursor, initMagneticButtons } from './animations/cursor.js';

document.addEventListener('DOMContentLoaded', async () => {

  // -- Set current year --
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -- Mobile menu --
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-links a');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';

        setTimeout(() => {
          const href = link.getAttribute('href');
          const target = document.querySelector(href);
          if (target) {
            const loco = getLocoScroll();
            if (loco) {
              loco.scrollTo(target, { offset: -80 });
            } else {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, 400);
      });
    });
  }

  // -- Step 1: Preloader --
  await animatePreloader();

  // -- Step 2: Smooth scrolling --
  const locoScroll = initSmoothScroll();
  const scrollContainer = getScrollContainer();

  // -- Step 3: Hero animations --
  animateHero();
  initHeroCanvas();

  // -- Step 4: Scroll-triggered animations --
  initScrollAnimations(scrollContainer);
  initCounters(scrollContainer);

  // -- Step 5: Cursor & interactions --
  initCursor();
  initMagneticButtons();
  initDoodleParallax();

  // -- Step 6: Doodle scroll reactions --
  if (locoScroll) {
    const doodles = document.querySelectorAll('.doodle');
    locoScroll.on('scroll', (args) => {
      const scrollY = args.scroll.y;
      doodles.forEach((d, i) => {
        const speed = (i % 3 + 1) * 0.1;
        d.style.transform = `translateY(${scrollY * speed}px) rotate(${scrollY * 0.02 * (i % 2 === 0 ? 1 : -1)}deg)`;
      });
    });
  }
});
