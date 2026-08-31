/**
 * RAPIDSOLVE — Navigation Module
 * Glassmorphism navbar scrolling state, mobile drawer toggle, and active section tracking.
 */

export class NavigationHandler {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.mobileToggle = document.querySelector('.mobile-toggle');
    this.navLinksContainer = document.querySelector('.nav-links');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section[id]');

    this.init();
  }

  init() {
    this.bindScrollState();
    this.bindMobileDrawer();
    this.bindActiveSectionObserver();
    this.bindSmoothAnchors();
    this.handleInitialHash();
  }

  handleInitialHash() {
    if (window.location.hash && window.location.hash !== '#') {
      setTimeout(() => {
        try {
          const target = document.querySelector(window.location.hash);
          if (target && !window.location.hash.includes('modal')) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        } catch (_) {}
      }, 150);
    }
  }

  bindScrollState() {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        this.navbar?.classList.add('scrolled');
      } else {
        this.navbar?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  bindMobileDrawer() {
    if (!this.mobileToggle || !this.navLinksContainer) return;

    this.mobileToggle.addEventListener('click', () => {
      this.mobileToggle.classList.toggle('open');
      this.navLinksContainer.classList.toggle('open');
      document.body.style.overflow = this.navLinksContainer.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile drawer when a link is clicked
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.mobileToggle.classList.remove('open');
        this.navLinksContainer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  bindActiveSectionObserver() {
    if (!this.sections.length || !this.navLinks.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          this.setActiveLink(currentId);
        }
      });
    }, observerOptions);

    this.sections.forEach(section => observer.observe(section));
  }

  setActiveLink(id) {
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  bindSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#' || targetId.includes('modal')) return;

        try {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        } catch (_) {}
      });
    });
  }
}
