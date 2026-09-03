/**
 * RAPIDSOLVE — Experimental UI Master Application Initializer
 * Orchestrates modern AI-assistant interface modules, canvas particle physics,
 * 3D card stacks, RouteVerse 3D tilt, and direct connection to the live Render backend.
 */

import { ExperimentalParticleEngine } from './experimental-particles.js';
import { NavigationHandler } from './navigation.js';
import { ScrollHandler } from './scroll.js';
import { AnimationEngine } from './animations.js';
import { ServicesStackManager } from './services.js';
import { PortfolioManager } from './portfolio.js';
import { WorkCard3D } from './work-card-3d.js';
import { TeamManager } from './team.js';
import { ContactFormHandler } from './contact.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Initialize Glowing Ambient AI Particle Physics
    const particles = new ExperimentalParticleEngine('particles-canvas');

    // 2. Initialize Floating Pill Navigation & Mobile Drawer
    const navigation = new NavigationHandler();

    // 3. Initialize Scroll Progress Bar & Back-to-Top
    const scroll = new ScrollHandler();

    // 4. Initialize Scroll Reveals & Metric Counters
    const animations = new AnimationEngine();

    // 5. Initialize Services 3D Card Stack
    const services = new ServicesStackManager();

    // 6. Initialize Portfolio Showcase & Modals
    const portfolio = new PortfolioManager();

    // 7. Initialize Work Card 3D Depth & Tilt Effects
    const workCard3D = new WorkCard3D();

    // 8. Initialize Team Component Interactions
    const team = new TeamManager();

    // 9. Initialize Contact Form & Toast Systems (Connected to live Render backend)
    const contact = new ContactFormHandler();

    // 10. Initialize AI Assistant Capability Chip Shortcuts
    initCapabilityChips();

    console.log('⚡ RAPIDSOLVE Experimental AI-Assistant UI Loaded Successfully');
  } catch (error) {
    console.error('RAPIDSOLVE experimental UI initialization notice:', error);
  }
});

/**
 * Interactive Capability Chips in Hero
 */
function initCapabilityChips() {
  const chips = document.querySelectorAll('.capability-chip[data-target]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const targetId = chip.getAttribute('data-target');
      const target = document.querySelector(targetId);
      if (target) {
        const offset = 80;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}
