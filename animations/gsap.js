/**
 * gsap.js — GSAP Animations Module
 * Hero intro, scroll reveals, counters, doodle parallax, hero canvas
 */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Preloader animation sequence
 */
export function animatePreloader() {
  return new Promise((resolve) => {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const rocketWrap = document.querySelector('.rocket-wrap');
    const particlesCanvas = document.getElementById('preloader-particles');

    if (!preloader) { resolve(); return; }

    // Preloader particles
    let pCtx, pW, pH;
    const particles = [];

    if (particlesCanvas) {
      pCtx = particlesCanvas.getContext('2d');
      pW = particlesCanvas.width = window.innerWidth;
      pH = particlesCanvas.height = window.innerHeight;

      for (let i = 0; i < 40; i++) {
        particles.push({
          x: pW / 2 + (Math.random() - 0.5) * 60,
          y: pH / 2 + 100 + Math.random() * 100,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 3 + 1,
          life: Math.random(),
          delay: Math.random() * 1500,
        });
      }

      function drawParticles() {
        pCtx.clearRect(0, 0, pW, pH);
        const now = Date.now();
        particles.forEach(p => {
          if (now < p.startTime + p.delay) return;
          p.y += p.vy;
          p.x += p.vx;
          p.life -= 0.01;
          if (p.life <= 0) {
            p.x = pW / 2 + (Math.random() - 0.5) * 60;
            p.y = pH / 2 + 80;
            p.life = 1;
          }
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          pCtx.fillStyle = `rgba(212, 175, 55, ${p.life * 0.5})`;
          pCtx.fill();
        });
        if (preloader.style.display !== 'none') {
          requestAnimationFrame(drawParticles);
        }
      }

      const startTime = Date.now();
      particles.forEach(p => p.startTime = startTime);
      drawParticles();
    }

    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) progress = 100;
      if (progressBar) progressBar.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(progressInterval);

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.to(preloader, {
              opacity: 0,
              duration: 0.6,
              ease: 'power2.inOut',
              onComplete: () => {
                preloader.style.display = 'none';
                resolve();
              }
            });
          }
        });

        if (rocketWrap) {
          tl.to(rocketWrap, {
            y: -window.innerHeight,
            duration: 1.2,
            ease: 'power3.in',
            delay: 0.3,
          });
        } else {
          tl.to({}, { duration: 0.5 });
        }
      }
    }, 120);
  });
}

/**
 * Hero intro animations
 */
export function animateHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to('.hero-title .reveal-word', {
    y: 0,
    duration: 1.4,
    stagger: 0.15,
    ease: 'power4.out',
  })
  .to('.hero-sub', {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'power3.out',
  }, '-=0.6')
  .to('.hero-buttons', {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'power3.out',
  }, '-=0.7');

  return tl;
}

/**
 * Hero gradient canvas background
 */
export function initHeroCanvas() {
  const canvas = document.getElementById('hero-gradient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const blobs = [
    { x: w * 0.3, y: h * 0.4, r: 300, vx: 0.5, vy: 0.3, color: 'rgba(212, 175, 55, 0.08)' },
    { x: w * 0.7, y: h * 0.6, r: 250, vx: -0.4, vy: -0.5, color: 'rgba(212, 175, 55, 0.05)' },
    { x: w * 0.5, y: h * 0.3, r: 200, vx: 0.3, vy: 0.6, color: 'rgba(245, 230, 163, 0.04)' },
  ];

  function drawCanvas() {
    ctx.clearRect(0, 0, w, h);
    blobs.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r || b.x > w + b.r) b.vx *= -1;
      if (b.y < -b.r || b.y > h + b.r) b.vy *= -1;
      const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      gradient.addColorStop(0, b.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    });
    requestAnimationFrame(drawCanvas);
  }

  drawCanvas();
}

/**
 * Scroll-triggered section reveals
 * Uses ScrollTrigger.batch for reliable triggering with Locomotive Scroll
 */
export function initScrollAnimations(scrollContainer) {
  const scroller = scrollContainer || undefined;

  // Helper: create a reliable scroll animation
  function scrollReveal(selector, fromVars, triggerSelector) {
    const elements = gsap.utils.toArray(selector);
    if (elements.length === 0) return;

    const trigger = triggerSelector || selector;

    elements.forEach((el, i) => {
      gsap.set(el, { opacity: 1, y: 0, x: 0 }); // ensure visible baseline
    });

    gsap.fromTo(elements,
      { ...fromVars, opacity: 0 },
      {
        scrollTrigger: {
          trigger: typeof trigger === 'string' ? document.querySelector(trigger) || elements[0] : trigger,
          scroller: scroller,
          start: 'top 88%',
          once: true,
        },
        y: 0,
        x: 0,
        opacity: 1,
        duration: fromVars.duration || 0.9,
        stagger: fromVars.stagger || 0.12,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      }
    );
  }

  // Generic reveal-up elements
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        scroller: scroller,
        start: 'top 90%',
        once: true,
      },
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    });
  });

  // Section labels
  gsap.utils.toArray('.section-label').forEach(el => {
    gsap.fromTo(el,
      { x: -30, opacity: 0 },
      {
        scrollTrigger: { trigger: el, scroller: scroller, start: 'top 92%', once: true },
        x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      }
    );
  });

  // Service cards
  scrollReveal('.service-card', { y: 50, stagger: 0.12, duration: 0.8 }, '.services-grid');

  // Work cards
  scrollReveal('.work-card', { y: 50, stagger: 0.08, duration: 0.8 }, '.work-grid');

  // Process steps
  scrollReveal('.process-step', { x: -40, stagger: 0.18, duration: 0.8 }, '.process-timeline');

  // Testimonial cards
  scrollReveal('.testimonial-card', { y: 40, stagger: 0.12, duration: 0.8 }, '.testimonial-track');

  // CTA
  const ctaTitle = document.querySelector('.cta-title');
  if (ctaTitle) {
    gsap.fromTo(ctaTitle,
      { y: 50, opacity: 0 },
      {
        scrollTrigger: { trigger: '.cta-section', scroller, start: 'top 80%', once: true },
        y: 0, opacity: 1, duration: 1.2, ease: 'power4.out',
      }
    );
  }

  // Footer
  gsap.fromTo('.footer-top, .footer-bottom',
    { y: 30, opacity: 0 },
    {
      scrollTrigger: { trigger: '.footer', scroller, start: 'top 90%', once: true },
      y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out',
    }
  );

  // Shimmer text effect
  gsap.utils.toArray('.shimmer-text').forEach(el => {
    gsap.fromTo(el,
      { backgroundPosition: '200% 50%' },
      {
        scrollTrigger: { trigger: el, scroller, start: 'top 85%', once: true },
        backgroundPosition: '-200% 50%',
        duration: 2.5,
        ease: 'power1.inOut',
      }
    );
  });
}

/**
 * Counter animation
 */
export function initCounters(scrollContainer) {
  const counters = document.querySelectorAll('.counter');
  if (counters.length === 0) return;

  let hasCounted = false;

  ScrollTrigger.create({
    trigger: '.about-stats',
    scroller: scrollContainer || undefined,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      if (hasCounted) return;
      hasCounted = true;
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        gsap.to(counter, {
          innerHTML: target,
          duration: 2.5,
          snap: { innerHTML: 1 },
          ease: 'power2.out',
        });
      });
    }
  });
}

/**
 * Doodle parallax on mouse move
 */
export function initDoodleParallax() {
  const doodles = document.querySelectorAll('.doodle');
  if (doodles.length === 0) return;

  const isTouchDevice = 'ontouchstart' in window;
  if (isTouchDevice) return;

  window.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;

    doodles.forEach((d, i) => {
      const speed = (i + 1) * 8;
      gsap.to(d, {
        x: mx * speed,
        y: my * speed,
        duration: 1.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  }, { passive: true });
}
