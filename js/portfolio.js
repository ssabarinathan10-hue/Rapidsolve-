/**
 * RAPIDSOLVE — Portfolio Showcase & 3D Interactive Module
 * Controls 3D card tilt, mouse-following lighting, parallax preview depth, and detail modals.
 */

export class PortfolioManager {
  constructor() {
    this.showcaseCards = document.querySelectorAll('.portfolio-showcase-card');
    this.modalOverlay = document.querySelector('.modal-overlay');
    this.modalContainer = document.querySelector('.modal-container');
    this.modalClose = document.querySelector('.modal-close');

    this.projectsData = {
      'p-routeverse': {
        title: 'RouteVerse',
        category: 'School Bus Tracking Platform',
        client: 'SmartTransit Education Systems',
        date: '2026',
        description: 'A modern digital platform for real-time school bus tracking, attendance management, notifications, and role-based portals. Built with low-latency GPS streaming, automated parent arrival alerts, and live student boarding verification.',
        tech: ['Web Application', 'Real-Time Tracking', 'Dashboard', 'WebSockets', 'Leaflet / Mapbox', 'Node.js'],
        badge: 'FEATURED PROJECT'
      },
      'p-ecommerce': {
        title: 'E-Commerce Platform',
        category: 'Online Shopping Experience',
        client: 'Aura Athletics & Tech',
        date: '2026',
        description: 'A modern and responsive e-commerce experience designed for product discovery, shopping, and digital business growth. Features ultra-responsive product filters, streamlined cart checkout flows, and sub-second catalog search.',
        tech: ['E-Commerce', 'Responsive Design', 'UI/UX', 'Next.js', 'Stripe', 'TailwindCSS']
      },
      'p-business': {
        title: 'Business Website',
        category: 'Corporate Website',
        client: 'Nova Solutions Global',
        date: '2026',
        description: 'A professional business website focused on strong branding, clear communication, responsive design, and customer conversion. Engineered for enterprise credibility with dynamic metric displays and high-converting lead capture pipelines.',
        tech: ['Website Development', 'Branding', 'Responsive', 'Three.js', 'Jamstack', 'SEO Engine']
      },
      'p-customapp': {
        title: 'Custom Web Application',
        category: 'Custom Digital Solution',
        client: 'SynapseFlow Analytics',
        date: '2026',
        description: 'A tailored web application designed around specific business requirements, workflows, dashboards, and automation. Delivers interactive telemetry graphs, automated microservice pipelines, and role-based permission controls.',
        tech: ['Web Application', 'Dashboard', 'Custom Software', 'WebGPU', 'FastAPI', 'Redis Telemetry']
      }
    };

    this.init();
  }

  init() {
    this.init3DCardInteractions();
    this.bindModalTriggers();
    this.bindModalClose();
  }

  /**
   * Initializes 3D card tilt, mouse-following specular glow, and parallax counter-depth
   */
  init3DCardInteractions() {
    // Only enable intensive tilt on devices with hover capability (desktop)
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    this.showcaseCards.forEach(card => {
      const browserFrame = card.querySelector('.card-browser-frame');
      const content = card.querySelector('.card-details-content');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Set CSS variables for radial specular glow
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
        
        if (browserFrame) {
          const shiftX = (rotateY * -0.6).toFixed(2);
          const shiftY = (rotateX * 0.6).toFixed(2);
          browserFrame.style.transform = `translateZ(35px) translate3d(${shiftX}px, ${shiftY}px, 0)`;
        }

        if (content) {
          content.style.transform = `translateZ(20px)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        if (browserFrame) {
          browserFrame.style.transform = 'translateZ(25px)';
        }
        if (content) {
          content.style.transform = 'translateZ(0px)';
        }
      });
    });
  }

  bindModalTriggers() {
    this.showcaseCards.forEach(card => {
      const id = card.getAttribute('data-id');
      const actionBtn = card.querySelector('.btn-portfolio-action');

      const triggerHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const data = this.projectsData[id];
        if (data) {
          this.openModal(data);
        }
      };

      if (actionBtn) {
        actionBtn.addEventListener('click', triggerHandler);
      }
    });
  }

  openModal(data) {
    if (!this.modalOverlay || !this.modalContainer) return;

    const modalBody = this.modalContainer.querySelector('.modal-body') || this.modalContainer;
    modalBody.innerHTML = `
      <div class="modal-close">&times;</div>
      <div style="margin-top: 1rem;">
        ${data.badge ? `<div style="margin-bottom: 0.5rem;"><span class="featured-badge" style="font-size: 0.7rem; padding: 0.25rem 0.75rem;">★ ${data.badge}</span></div>` : ''}
        <span style="color: var(--accent-cyan); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.2px;">${data.category}</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; margin: 0.5rem 0 1rem 0; color: var(--text-main);">${data.title}</h2>
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
          <div>
            <h4 style="color: var(--text-main); margin-bottom: 0.5rem; font-family: var(--font-heading);">Project Overview</h4>
            <p style="color: var(--text-muted); line-height: 1.7; font-size: 0.95rem;">${data.description}</p>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
            <div style="margin-bottom: 0.75rem;">
              <span style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; display: block;">Client / Domain</span>
              <strong style="color: var(--text-main); font-size: 0.95rem;">${data.client}</strong>
            </div>
            <div>
              <span style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; display: block;">Delivered</span>
              <strong style="color: var(--text-main); font-size: 0.95rem;">${data.date}</strong>
            </div>
          </div>
        </div>

        <div>
          <h4 style="color: var(--text-main); margin-bottom: 0.75rem; font-family: var(--font-heading);">Technologies & Architecture</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${data.tech.map(t => `<span class="service-tag" style="padding: 0.4rem 0.85rem; font-size: 0.85rem;">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    // Re-bind close button inside updated modal DOM
    const newCloseBtn = this.modalContainer.querySelector('.modal-close');
    newCloseBtn?.addEventListener('click', () => this.closeModal());

    this.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  bindModalClose() {
    this.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalOverlay?.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.modalOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }
}
