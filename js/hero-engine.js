/**
 * RAPIDSOLVE — Hero 3D Digital Innovation Engine Interactive Controller
 * Applies smooth multi-layer 3D parallax tilt on mousemove and specular lighting effects.
 */

export class HeroEngineHandler {
  constructor() {
    this.stage = document.getElementById('hero-engine-stage');
    this.scene = this.stage?.querySelector('.engine-scene-3d');
    this.core = this.stage?.querySelector('.engine-core-orb');
    this.rings = this.stage?.querySelector('.engine-rings-wrapper');
    this.nodes = this.stage?.querySelectorAll('.engine-sat-node');

    if (this.stage && this.scene) {
      this.init();
    }
  }

  init() {
    this.bindMouseMove();
  }

  bindMouseMove() {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovered = false;

    this.stage.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    this.stage.addEventListener('mousemove', (e) => {
      const rect = this.stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalize between -1 and 1
      mouseX = (x - centerX) / centerX;
      mouseY = (y - centerY) / centerY;
    });

    this.stage.addEventListener('mouseleave', () => {
      isHovered = false;
      mouseX = 0;
      mouseY = 0;
    });

    // Smooth lerp frame loop
    const animate = () => {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      if (this.scene) {
        const tiltX = currentY * -12;
        const tiltY = currentX * 14;

        this.stage.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

        // Parallax depth on satellite nodes
        this.nodes?.forEach(node => {
          const depth = parseFloat(node.getAttribute('data-depth') || '1.0');
          const transX = currentX * 18 * depth;
          const transY = currentY * 18 * depth;
          node.style.translate = `${transX}px ${transY}px`;
        });

        // Parallax depth on core orb
        if (this.core) {
          this.core.style.translate = `${currentX * 10}px ${currentY * 10}px`;
        }

        // Parallax depth on gyroscope rings
        if (this.rings) {
          this.rings.style.translate = `${currentX * 6}px ${currentY * 6}px`;
        }
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}
