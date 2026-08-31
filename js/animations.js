/**
 * RAPIDSOLVE — Animations Engine
 * IntersectionObserver scroll reveal triggers, 3D card tilt interactions, and metric counter animations.
 */

export class AnimationEngine {
  constructor() {
    this.revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-fade, .reveal-left, .reveal-right');
    this.metricNumbers = document.querySelectorAll('.metric-number');
    this.tiltCards = document.querySelectorAll('.service-card, .portfolio-item, .team-card');

    this.init();
  }

  init() {
    this.initScrollReveal();
    this.initCounterAnimation();
    this.init3DTilt();
  }

  initScrollReveal() {
    if (!this.revealElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // Trigger once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    this.revealElements.forEach(el => observer.observe(el));
  }

  initCounterAnimation() {
    if (!this.metricNumbers.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.metricNumbers.forEach(num => observer.observe(num));
  }

  animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target') || '0');
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentVal = Math.floor(target * easeProgress);

      element.textContent = `${prefix}${currentVal}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = `${prefix}${target}${suffix}`;
      }
    };

    requestAnimationFrame(updateCount);
  }

  init3DTilt() {
    this.tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }
}
