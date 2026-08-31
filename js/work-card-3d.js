/**
 * RAPIDSOLVE — Work Card 3D Tilt & Parallax Controller
 * Mouse-tracking perspective tilt with per-element depth parallax.
 */

export class WorkCard3D {
  constructor() {
    this.cards = document.querySelectorAll('.work-card-3d');
    if (this.cards.length) this.init();
  }

  init() {
    this.cards.forEach(card => this.bindCard(card));
  }

  bindCard(card) {
    const scene = card.querySelector('.wc-scene');
    const depthEls = card.querySelectorAll('[data-depth]');

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = null;
    let isHovered = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      currentX = lerp(currentX, targetX, 0.1);
      currentY = lerp(currentY, targetY, 0.1);

      if (scene) {
        scene.style.transform = `rotateY(${currentX}deg) rotateX(${currentY}deg)`;
      }

      // Parallax per depth element
      depthEls.forEach(el => {
        const depth = parseFloat(el.getAttribute('data-depth') || '0.2');
        const tx = currentX * depth * 5;
        const ty = -currentY * depth * 5;
        el.style.translate = `${tx}px ${ty}px`;
      });

      if (isHovered || Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
        rafId = requestAnimationFrame(animate);
      }
    };

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;  // 0–1
      const my = (e.clientY - rect.top) / rect.height;  // 0–1

      targetX = (mx - 0.5) * 18;   // -9deg to +9deg
      targetY = (my - 0.5) * -14;  // +7deg to -7deg

      if (!isHovered) {
        isHovered = true;
        rafId = requestAnimationFrame(animate);
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
      // Let lerp wind down naturally
      rafId = requestAnimationFrame(animate);
    });
  }
}
