/**
 * RAPIDSOLVE — Team Showcase Engine
 * Team member cards, expandable profiles, and interactive skill tags.
 */

export class TeamManager {
  constructor() {
    this.teamCards = document.querySelectorAll('.team-card');
    this.init();
  }

  init() {
    this.bindHoverGlow();
  }

  bindHoverGlow() {
    this.teamCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const avatar = card.querySelector('.team-avatar-wrapper');
        if (avatar) {
          avatar.style.transform = 'scale(1.06)';
          avatar.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
      });

      card.addEventListener('mouseleave', () => {
        const avatar = card.querySelector('.team-avatar-wrapper');
        if (avatar) {
          avatar.style.transform = 'scale(1)';
        }
      });
    });
  }
}
