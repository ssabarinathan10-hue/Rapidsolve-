/**
 * RAPIDSOLVE — Scroll Handler
 * Calculates scroll progress, back-to-top button visibility, and scroll utilities.
 */

export class ScrollHandler {
  constructor() {
    this.progressBar = document.querySelector('.scroll-progress-bar');
    this.backToTopBtn = document.querySelector('.back-to-top');

    this.init();
  }

  init() {
    this.bindScrollEvents();
    this.bindBackToTop();
  }

  bindScrollEvents() {
    const updateScrollMetrics = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      // Update progress bar width
      if (this.progressBar) {
        this.progressBar.style.width = `${progress}%`;
      }

      // Show or hide back-to-top button
      if (this.backToTopBtn) {
        if (scrollTop > 400) {
          this.backToTopBtn.classList.add('visible');
        } else {
          this.backToTopBtn.classList.remove('visible');
        }
      }
    };

    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    updateScrollMetrics();
  }

  bindBackToTop() {
    if (!this.backToTopBtn) return;

    this.backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}
