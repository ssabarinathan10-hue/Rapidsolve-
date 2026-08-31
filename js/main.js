/**
 * RAPIDSOLVE — Master Application Initialization
 * Orchestrates all interactive sub-modules safely when DOM is ready.
 */

import { ParticleEngine } from './particles.js';
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
    // 1. Initialize HTML5 Canvas Particle Physics
    const particles = new ParticleEngine('particles-canvas');

    // 2. Initialize Navigation & Header Logic
    const navigation = new NavigationHandler();

    // 3. Initialize Scroll Progress & Utilities
    const scroll = new ScrollHandler();

    // 4. Initialize Animations & Reveal Triggers
    const animations = new AnimationEngine();

    // 5. Initialize Services 3D Card Stack
    const services = new ServicesStackManager();

    // 6. Initialize Portfolio Showcase & Modals
    const portfolio = new PortfolioManager();

    // 6b. Initialize Work Card 3D Tilt Effects
    const workCard3D = new WorkCard3D();

    // 7. Initialize Team Component Interactions
    const team = new TeamManager();

    // 8. Initialize Contact Form & Toast Systems
    const contact = new ContactFormHandler();

    console.log('⚡ RAPIDSOLVE Application Stack Initialized Successfully');
  } catch (error) {
    console.error('RAPIDSOLVE initialization warning:', error);
  }
});
