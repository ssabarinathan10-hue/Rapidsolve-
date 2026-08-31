/**
 * RAPIDSOLVE — Interactive 3D Service Card Stack Controller
 * Manages the physical deck-of-cards 3D perspective, swipe gestures,
 * Next/Prev navigation, circular looping, and keyboard triggers.
 */

export class ServicesStackManager {
  constructor() {
    this.stackContainer = document.getElementById('services-card-stack');
    this.cards = document.querySelectorAll('.service-stack-card');
    this.prevBtn = document.getElementById('service-prev-btn');
    this.nextBtn = document.getElementById('service-next-btn');
    this.counterCurrent = document.getElementById('service-counter-current');
    this.counterTotal = document.querySelector('.counter-total');
    this.dotsContainer = document.getElementById('services-stack-dots');

    this.currentIndex = 0;
    this.totalCards = this.cards.length;
    this.isAnimating = false;

    // Touch gesture tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;

    if (this.totalCards > 0) {
      this.init();
    }
  }

  init() {
    this.createPaginationDots();
    this.updateStack('init');
    this.bindEvents();
  }

  createPaginationDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    for (let i = 0; i < this.totalCards; i++) {
      const dot = document.createElement('button');
      dot.className = `stack-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to service ${i + 1}`);
      dot.setAttribute('data-target-index', i);
      dot.addEventListener('click', () => {
        if (this.isAnimating || this.currentIndex === i) return;
        this.goTo(i);
      });
      this.dotsContainer.appendChild(dot);
    }
  }

  bindEvents() {
    // Button clicks
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // Direct card clicks
    this.cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (this.currentIndex !== index && !this.isAnimating) {
          this.goTo(index);
        }
      });
    });

    // Touch Swipe Gestures
    if (this.stackContainer) {
      this.stackContainer.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      this.stackContainer.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleSwipe();
      }, { passive: true });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // Check if services section is in viewport
      const rect = this.stackContainer?.getBoundingClientRect();
      const isInView = rect && rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInView) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        }
      }
    });
  }

  handleSwipe() {
    const diffX = this.touchEndX - this.touchStartX;
    const diffY = this.touchEndY - this.touchStartY;

    // Ensure horizontal swipe is dominant and above threshold
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swiped Left -> Next
        this.next();
      } else {
        // Swiped Right -> Previous
        this.prev();
      }
    }
  }

  next() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Active card slide exit animation
    const currentCard = this.cards[this.currentIndex];
    currentCard.classList.add('slide-peel-next');

    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.totalCards;
      this.updateStack('next');
      currentCard.classList.remove('slide-peel-next');
      this.isAnimating = false;
    }, 280);
  }

  prev() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
    this.updateStack('prev');

    setTimeout(() => {
      this.isAnimating = false;
    }, 380);
  }

  goTo(targetIndex) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = targetIndex;
    this.updateStack('goto');
    setTimeout(() => {
      this.isAnimating = false;
    }, 380);
  }

  updateStack(action = 'update') {
    // Update counter
    const formattedNum = String(this.currentIndex + 1).padStart(2, '0');
    if (this.counterCurrent) {
      this.counterCurrent.textContent = formattedNum;
    }

    // Update pagination dots
    const dots = this.dotsContainer?.querySelectorAll('.stack-dot');
    dots?.forEach((dot, idx) => {
      if (idx === this.currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update 3D card deck positioning
    this.cards.forEach((card, i) => {
      // Calculate circular offset distance from active card
      const diff = (i - this.currentIndex + this.totalCards) % this.totalCards;

      // Remove active class
      card.classList.remove('active', 'stack-pos-0', 'stack-pos-1', 'stack-pos-2', 'stack-pos-3', 'stack-pos-hidden');

      if (diff === 0) {
        // Active Front Card
        card.classList.add('active', 'stack-pos-0');
        card.setAttribute('aria-hidden', 'false');
      } else if (diff === 1) {
        // 1st Card Behind
        card.classList.add('stack-pos-1');
        card.setAttribute('aria-hidden', 'true');
      } else if (diff === 2) {
        // 2nd Card Behind
        card.classList.add('stack-pos-2');
        card.setAttribute('aria-hidden', 'true');
      } else if (diff === 3) {
        // 3rd Card Behind
        card.classList.add('stack-pos-3');
        card.setAttribute('aria-hidden', 'true');
      } else {
        // Remaining cards in queue behind
        card.classList.add('stack-pos-hidden');
        card.setAttribute('aria-hidden', 'true');
      }
    });
  }
}
