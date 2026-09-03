/**
 * RAPIDSOLVE — Contact Form Handler
 * Validates, submits to POST /api/contact, shows real success/error feedback.
 */

// Default Render Backend API base URL
const DEFAULT_API_BASE = 'https://rapidsolve-backend.onrender.com';

/**
 * Resolve the Contact API endpoint:
 * - Configurable override: window.__RAPDISOLVE_API_URL__ (or legacy window.__RAPIDSOLVE_API_URL__)
 * - Default: https://rapdisolve-backend.onrender.com/api/contact
 */
export function getContactApiUrl() {
  const customUrl = typeof window !== 'undefined' && (window.__RAPDISOLVE_API_URL__ || window.__RAPIDSOLVE_API_URL__);
  const baseUrl = (typeof customUrl === 'string' && customUrl.trim())
    ? customUrl.trim()
    : DEFAULT_API_BASE;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  if (cleanBase.endsWith('/api/contact')) {
    return cleanBase;
  }
  return `${cleanBase}/api/contact`;
}

export const CONTACT_API = getContactApiUrl();

export class ContactFormHandler {
  constructor() {
    this.form       = document.getElementById('contact-form');
    this.toast      = document.querySelector('.toast-notification');
    this.submitting = false; // duplicate-submit guard

    this.init();
  }

  init() {
    if (!this.form) return;
    this.bindFormSubmit();
    this.bindInputFeedback();
  }

  // ─── Form Submit ────────────────────────────────────────────────────────────

  bindFormSubmit() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Duplicate-submit guard
      if (this.submitting) return;
      if (!this.validateForm()) return;

      const submitBtn  = this.form.querySelector('button[type="submit"]');
      const origHTML   = submitBtn.innerHTML;

      // Loading state
      this.submitting       = true;
      submitBtn.disabled    = true;
      submitBtn.innerHTML   = `
        <svg class="btn-icon" style="animation:spin-slow 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2 a 10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        Sending...
      `;

      // Collect form data
      const payload = {
        name:    this.form.querySelector('#contact-name')?.value.trim()    || '',
        email:   this.form.querySelector('#contact-email')?.value.trim()   || '',
        subject: this.form.querySelector('#contact-service')?.value.trim() || 'General Inquiry',
        message: this.form.querySelector('#contact-message')?.value.trim() || ''
      };

      try {
        const endpoint = getContactApiUrl();
        const res  = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // ✅ Success
          this.form.reset();
          this.showToast("✓ Message sent! We'll respond within 24 hours.", 'success');
        } else {
          // ❌ Server-side validation error
          const errMsg = Array.isArray(data.errors)
            ? data.errors.join(' ')
            : (data.message || 'Submission failed. Please try again.');
          this.showToast('✕ ' + errMsg, 'error');
        }

      } catch (err) {
        // ❌ Network / server unreachable
        console.error('[Contact] Network error:', err);
        this.showToast('✕ Could not reach the server. Please check your connection.', 'error');
      } finally {
        // Always restore button state
        submitBtn.disabled  = false;
        submitBtn.innerHTML = origHTML;
        this.submitting     = false;
      }
    });
  }

  // ─── Frontend Validation ────────────────────────────────────────────────────

  validateForm() {
    let isValid = true;

    const name    = this.form.querySelector('#contact-name');
    const email   = this.form.querySelector('#contact-email');
    const message = this.form.querySelector('#contact-message');

    [name, email, message].forEach(input => {
      if (!input) return;
      if (!input.value.trim()) {
        this.setError(input, 'This field is required.');
        isValid = false;
      } else {
        this.clearError(input);
      }
    });

    // Email format check
    if (email && email.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) {
        this.setError(email, 'Please enter a valid email address.');
        isValid = false;
      }
    }

    // Message length
    if (message && message.value.trim().length > 0 && message.value.trim().length < 10) {
      this.setError(message, 'Message must be at least 10 characters.');
      isValid = false;
    }

    return isValid;
  }

  setError(input, msg) {
    input.style.borderColor = '#EF4444';
    let errorEl = input.parentNode.querySelector('.error-msg');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-msg';
      Object.assign(errorEl.style, {
        color: '#EF4444', fontSize: '0.78rem',
        marginTop: '0.35rem', display: 'block'
      });
      input.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = msg;
  }

  clearError(input) {
    input.style.borderColor = 'var(--glass-border)';
    const errorEl = input.parentNode.querySelector('.error-msg');
    if (errorEl) errorEl.remove();
  }

  bindInputFeedback() {
    const inputs = this.form.querySelectorAll('.form-input, .form-textarea, .form-select');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  // ─── Toast Notification ─────────────────────────────────────────────────────

  showToast(message, type = 'success') {
    if (!this.toast) return;

    const toastText = this.toast.querySelector('.toast-text') || this.toast;
    toastText.textContent = message;

    // Apply error styling if needed
    if (type === 'error') {
      this.toast.style.borderColor = 'rgba(239,68,68,0.4)';
      const icon = this.toast.querySelector('svg');
      if (icon) icon.setAttribute('stroke', '#EF4444');
    } else {
      this.toast.style.borderColor = '';
      const icon = this.toast.querySelector('svg');
      if (icon) icon.setAttribute('stroke', 'var(--accent-emerald)');
    }

    this.toast.classList.add('show');
    setTimeout(() => this.toast.classList.remove('show'), 5000);
  }
}
