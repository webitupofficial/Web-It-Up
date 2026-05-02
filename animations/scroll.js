/**
 * scroll.js — Locomotive Scroll + ScrollTrigger Integration
 * Smooth scrolling, parallax, and scroll-based UI changes
 */
import LocomotiveScroll from 'locomotive-scroll';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let locoScroll = null;

export function initSmoothScroll() {
  const container = document.querySelector('[data-scroll-container]');
  if (!container) return null;

  locoScroll = new LocomotiveScroll({
    el: container,
    smooth: true,
    multiplier: 1,
    lerp: 0.06, // Reduced from 0.08 for a more premium, buttery-smooth scroll
    class: 'is-revealed',
    smartphone: { smooth: false },
    tablet: { smooth: true, breakpoint: 1024 },
  });

  // Sync with ScrollTrigger
  locoScroll.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(container, {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, 0, 0)
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: container.style.transform ? 'transform' : 'fixed',
  });

  // Navbar scroll state
  const navbar = document.getElementById('navbar');
  if (navbar) {
    locoScroll.on('scroll', (args) => {
      if (args.scroll.y > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Internal nav links (smooth scroll-to)
  document.querySelectorAll('a[data-scroll-to]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        locoScroll.scrollTo(target, { offset: -80 });
      }
    });
  });

  // Refresh
  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  setTimeout(() => ScrollTrigger.refresh(), 500);

  return locoScroll;
}

export function getLocoScroll() {
  return locoScroll;
}

export function getScrollContainer() {
  return document.querySelector('[data-scroll-container]');
}
