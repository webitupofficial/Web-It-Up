/**
 * cursor.js — Custom Cursor Module
 * Glowing dot cursor + golden canvas trail + sparkle burst + magnetic buttons
 */

export function initCursor() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  const dot = document.getElementById('cursor-dot');
  const canvas = document.getElementById('cursor-canvas');
  if (!dot || !canvas) return;

  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  let mouseX = w / 2;
  let mouseY = h / 2;
  let trailX = w / 2;
  let trailY = h / 2;

  const trail = [];
  const MAX_TRAIL = 30;
  const sparkles = [];

  // Resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }, 100);
  });

  // Track mouse — use transform for GPU-accelerated positioning
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
  }, { passive: true });

  // Sparkle burst on click
  window.addEventListener('mousedown', (e) => {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      sparkles.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 3 + 1,
      });
    }
  }, { passive: true });

  // Hover detection for cursor enlargement
  const interactiveElements = document.querySelectorAll('a, button, .magnetic-btn, .service-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('hovering'));
    el.addEventListener('mouseleave', () => dot.classList.remove('hovering'));
  });

  // Render loop
  function render() {
    ctx.clearRect(0, 0, w, h);

    // Smooth trail interpolation
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;

    trail.push({ x: trailX, y: trailY });
    if (trail.length > MAX_TRAIL) trail.shift();

    // Draw golden trail
    if (trail.length > 1) {
      for (let i = 0; i < trail.length - 1; i++) {
        const t = i / trail.length;
        ctx.beginPath();
        ctx.moveTo(trail[i].x, trail[i].y);
        ctx.lineTo(trail[i + 1].x, trail[i + 1].y);
        ctx.strokeStyle = `rgba(212, 175, 55, ${t * 0.6})`;
        ctx.lineWidth = t * 5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Render sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.08;
      s.vx *= 0.97;
      s.vy *= 0.97;
      s.life -= 0.025;

      if (s.life <= 0) {
        sparkles.splice(i, 1);
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${s.life})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/**
 * Magnetic button effect
 */
export function initMagneticButtons() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const strength = 25;

      btn.style.transform = `translate(${(dx / rect.width) * strength}px, ${(dy / rect.height) * strength}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}
