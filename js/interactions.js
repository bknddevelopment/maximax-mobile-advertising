/**
 * MaxiMax Advertising - User Interactions
 * Form validation, touch gestures, and interactive components
 * @version 2.0.0
 * @description Production-ready interaction handlers with accessibility
 */

(function () {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    debounceDelay: 300,
    throttleDelay: 100,
    swipeThreshold: 50,
    tapTimeout: 200,
    doubleTapTimeout: 300,
    longPressTimeout: 500,
    rippleDuration: 600,
    formSubmitDelay: 2000,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // ============================================
  // FORM VALIDATION & HANDLING
  // ============================================

  class FormHandler {
    constructor() {
      this.forms = new Map();
      this.validators = this.setupValidators();
      this.init();
    }

    init() {
      this.setupForms();
      this.setupInputs();
      this.setupTextareas();
      this.setupSelects();
      this.setupFileInputs();
    }

    setupValidators() {
      return {
        required: value => ({
          valid: value.trim().length > 0,
          message: 'This field is required'
        }),

        email: value => ({
          valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Please enter a valid email address'
        }),

        phone: value => ({
          valid: /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
          message: 'Please enter a valid phone number'
        }),

        url: value => {
          try {
            new URL(value);
            return { valid: true };
          } catch {
            return { valid: false, message: 'Please enter a valid URL' };
          }
        },

        minLength: min => value => ({
          valid: value.length >= min,
          message: `Must be at least ${min} characters`
        }),

        maxLength: max => value => ({
          valid: value.length <= max,
          message: `Must be no more than ${max} characters`
        }),

        pattern: (regex, message) => value => ({
          valid: regex.test(value),
          message: message || 'Invalid format'
        })
      };
    }

    setupForms() {
      document.querySelectorAll('form').forEach(form => {
        const formData = {
          fields: new Map(),
          isValid: false,
          isDirty: false
        };

        this.forms.set(form, formData);

        // Prevent default submission
        form.addEventListener('submit', e => this.handleSubmit(e, form));

        // Track form changes
        form.addEventListener('input', () => {
          formData.isDirty = true;
        });

        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', e => {
          if (formData.isDirty) {
            e.preventDefault();
            e.returnValue = '';
          }
        });
      });
    }

    setupInputs() {
      document.querySelectorAll('input:not([type="file"]), select').forEach(input => {
        // Floating label effect
        this.setupFloatingLabel(input);

        // Real-time validation
        const validators = this.getValidatorsForInput(input);

        input.addEventListener('blur', () => {
          this.validateField(input, validators);
        });

        // Live validation for certain types
        if (input.type === 'email' || input.type === 'tel' || input.type === 'url') {
          input.addEventListener('input', debounce(() => {
            if (input.value) {
              this.validateField(input, validators);
            }
          }, CONFIG.debounceDelay));
        }

        // Password strength indicator
        if (input.type === 'password') {
          this.setupPasswordStrength(input);
        }

        // Input masking for phone numbers
        if (input.type === 'tel') {
          this.setupPhoneMask(input);
        }
      });
    }

    setupTextareas() {
      document.querySelectorAll('textarea').forEach(textarea => {
        // Auto-resize
        this.setupAutoResize(textarea);

        // Character counter
        if (textarea.maxLength > 0) {
          this.setupCharacterCounter(textarea);
        }

        // Floating label
        this.setupFloatingLabel(textarea);

        // Validation
        const validators = this.getValidatorsForInput(textarea);
        textarea.addEventListener('blur', () => {
          this.validateField(textarea, validators);
        });
      });
    }

    setupSelects() {
      document.querySelectorAll('select').forEach(select => {
        // Custom select dropdown
        if (select.classList.contains('custom-select')) {
          this.setupCustomSelect(select);
        }

        // Validation
        const validators = this.getValidatorsForInput(select);
        select.addEventListener('change', () => {
          this.validateField(select, validators);
        });
      });
    }

    setupFileInputs() {
      document.querySelectorAll('input[type="file"]').forEach(input => {
        this.setupFileUpload(input);
      });
    }

    setupFloatingLabel(input) {
      const wrapper = input.parentElement;
      if (!wrapper.classList.contains('form-group')) {
        return;
      }

      const label = wrapper.querySelector('label');
      if (!label) {
        return;
      }

      // Check initial state
      if (input.value) {
        wrapper.classList.add('has-value');
      }

      input.addEventListener('focus', () => {
        wrapper.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        wrapper.classList.remove('focused');
        wrapper.classList.toggle('has-value', input.value.length > 0);
      });
    }

    setupAutoResize(textarea) {
      const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      textarea.addEventListener('input', resize);
      resize(); // Initial resize
    }

    setupCharacterCounter(element) {
      const maxLength = element.maxLength;
      const counter = document.createElement('div');
      counter.className = 'char-counter';
      counter.setAttribute('aria-live', 'polite');
      counter.setAttribute('aria-atomic', 'true');
      element.parentElement.appendChild(counter);

      const updateCounter = () => {
        const length = element.value.length;
        const remaining = maxLength - length;
        counter.textContent = `${length} / ${maxLength}`;

        if (remaining < 20) {
          counter.classList.add('warning');
        } else {
          counter.classList.remove('warning');
        }

        if (remaining < 0) {
          counter.classList.add('error');
        } else {
          counter.classList.remove('error');
        }
      };

      element.addEventListener('input', updateCounter);
      updateCounter();
    }

    setupPasswordStrength(input) {
      const indicator = document.createElement('div');
      indicator.className = 'password-strength';
      indicator.innerHTML = `
                <div class="strength-bar">
                    <div class="strength-fill"></div>
                </div>
                <span class="strength-text"></span>
            `;

      input.parentElement.appendChild(indicator);

      input.addEventListener('input', () => {
        const strength = this.calculatePasswordStrength(input.value);
        const fill = indicator.querySelector('.strength-fill');
        const text = indicator.querySelector('.strength-text');

        fill.style.width = `${strength.score * 25}%`;
        fill.className = `strength-fill strength-${strength.level}`;
        text.textContent = strength.message;
      });
    }

    calculatePasswordStrength(password) {
      let score = 0;
      const checks = [
        { regex: /.{8,}/, points: 1 }, // Length
        { regex: /[a-z]/, points: 1 }, // Lowercase
        { regex: /[A-Z]/, points: 1 }, // Uppercase
        { regex: /[0-9]/, points: 1 }, // Numbers
        { regex: /[^a-zA-Z0-9]/, points: 1 } // Special chars
      ];

      checks.forEach(check => {
        if (check.regex.test(password)) {
          score += check.points;
        }
      });

      const levels = ['weak', 'fair', 'good', 'strong', 'excellent'];
      const messages = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

      return {
        score: Math.min(score, 4),
        level: levels[Math.min(score, 4)],
        message: messages[Math.min(score, 4)]
      };
    }

    setupPhoneMask(input) {
      input.addEventListener('input', e => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 0) {
          if (value.length <= 3) {
            value = `(${value}`;
          } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
          } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
          }
        }

        e.target.value = value;
      });
    }

    setupCustomSelect(select) {
      // Create custom dropdown UI
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';

      const display = document.createElement('div');
      display.className = 'custom-select-display';
      display.textContent = select.options[select.selectedIndex].textContent;

      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select-dropdown';

      Array.from(select.options).forEach((option, index) => {
        const item = document.createElement('div');
        item.className = 'custom-select-item';
        item.textContent = option.textContent;
        item.dataset.value = option.value;

        if (index === select.selectedIndex) {
          item.classList.add('selected');
        }

        item.addEventListener('click', () => {
          select.selectedIndex = index;
          select.dispatchEvent(new Event('change'));
          display.textContent = option.textContent;
          dropdown.classList.remove('open');

          dropdown.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
          });
          item.classList.add('selected');
        });

        dropdown.appendChild(item);
      });

      wrapper.appendChild(display);
      wrapper.appendChild(dropdown);

      select.style.display = 'none';
      select.parentElement.insertBefore(wrapper, select);

      display.addEventListener('click', () => {
        dropdown.classList.toggle('open');
      });

      document.addEventListener('click', e => {
        if (!wrapper.contains(e.target)) {
          dropdown.classList.remove('open');
        }
      });
    }

    setupFileUpload(input) {
      const wrapper = document.createElement('div');
      wrapper.className = 'file-upload-wrapper';

      const label = document.createElement('label');
      label.className = 'file-upload-label';
      label.innerHTML = `
                <span class="file-upload-icon">📁</span>
                <span class="file-upload-text">Choose file...</span>
                <span class="file-upload-button">Browse</span>
            `;

      const preview = document.createElement('div');
      preview.className = 'file-upload-preview';

      wrapper.appendChild(label);
      wrapper.appendChild(preview);

      input.parentElement.insertBefore(wrapper, input);
      input.style.display = 'none';

      label.addEventListener('click', () => input.click());

      input.addEventListener('change', e => {
        const files = Array.from(e.target.files);
        const text = label.querySelector('.file-upload-text');

        if (files.length === 0) {
          text.textContent = 'Choose file...';
          preview.innerHTML = '';
        } else if (files.length === 1) {
          text.textContent = files[0].name;
          this.previewFile(files[0], preview);
        } else {
          text.textContent = `${files.length} files selected`;
          preview.innerHTML = '';
          files.forEach(file => this.previewFile(file, preview));
        }
      });

      // Drag and drop
      wrapper.addEventListener('dragover', e => {
        e.preventDefault();
        wrapper.classList.add('dragover');
      });

      wrapper.addEventListener('dragleave', () => {
        wrapper.classList.remove('dragover');
      });

      wrapper.addEventListener('drop', e => {
        e.preventDefault();
        wrapper.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      });
    }

    previewFile(file, container) {
      const item = document.createElement('div');
      item.className = 'file-preview-item';

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          item.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
        };
        reader.readAsDataURL(file);
      } else {
        item.innerHTML = `
                    <span class="file-icon">📄</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                `;
      }

      container.appendChild(item);
    }

    formatFileSize(bytes) {
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    getValidatorsForInput(input) {
      const validators = [];

      if (input.required) {
        validators.push(this.validators.required);
      }

      if (input.type === 'email') {
        validators.push(this.validators.email);
      }

      if (input.type === 'tel') {
        validators.push(this.validators.phone);
      }

      if (input.type === 'url') {
        validators.push(this.validators.url);
      }

      if (input.minLength) {
        validators.push(this.validators.minLength(input.minLength));
      }

      if (input.maxLength) {
        validators.push(this.validators.maxLength(input.maxLength));
      }

      if (input.pattern) {
        validators.push(this.validators.pattern(new RegExp(input.pattern), input.title));
      }

      return validators;
    }

    validateField(field, validators) {
      const value = field.value;
      const errors = [];

      for (const validator of validators) {
        const result = validator(value);
        if (!result.valid) {
          errors.push(result.message);
        }
      }

      this.showFieldFeedback(field, errors);

      return errors.length === 0;
    }

    showFieldFeedback(field, errors) {
      const wrapper = field.parentElement;
      let feedback = wrapper.querySelector('.field-feedback');

      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'field-feedback';
        feedback.setAttribute('role', 'alert');
        feedback.setAttribute('aria-live', 'polite');
        wrapper.appendChild(feedback);
      }

      if (errors.length > 0) {
        field.classList.add('invalid');
        field.classList.remove('valid');
        feedback.className = 'field-feedback error';
        feedback.textContent = errors[0];
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', feedback.id);
      } else if (field.value) {
        field.classList.add('valid');
        field.classList.remove('invalid');
        feedback.className = 'field-feedback success';
        feedback.textContent = '';
        field.setAttribute('aria-invalid', 'false');
      } else {
        field.classList.remove('valid', 'invalid');
        feedback.textContent = '';
        field.removeAttribute('aria-invalid');
      }
    }

    async handleSubmit(e, form) {
      e.preventDefault();

      const formData = this.forms.get(form);
      const submitButton = form.querySelector('[type="submit"]');
      const originalText = submitButton.textContent;

      // Validate all fields
      let isValid = true;
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        const validators = this.getValidatorsForInput(input);
        if (!this.validateField(input, validators)) {
          isValid = false;
        }
      });

      if (!isValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          this.showNotification('Please correct the errors in the form', 'error');
        }
        return;
      }

      // Show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Sending...';

      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, CONFIG.formSubmitDelay));

      // Success state
      submitButton.innerHTML = '✓ Sent Successfully!';
      submitButton.classList.add('success');

      // Show success notification
      this.showNotification('Thank you! We\'ll contact you within 2 hours.', 'success');

      // Reset form
      setTimeout(() => {
        form.reset();
        formData.isDirty = false;
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        submitButton.classList.remove('success');

        // Clear validation states
        form.querySelectorAll('.valid, .invalid').forEach(field => {
          field.classList.remove('valid', 'invalid');
        });

        form.querySelectorAll('.field-feedback').forEach(feedback => {
          feedback.textContent = '';
        });
      }, 3000);

      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          event_category: 'engagement',
          event_label: form.id || 'contact_form'
        });
      }
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.setAttribute('role', 'alert');
      notification.innerHTML = `
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            `;

      document.body.appendChild(notification);

      notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
      });

      // Auto remove
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    }

    getNotificationIcon(type) {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      return icons[type] || icons.info;
    }
  }

  // ============================================
  // BUTTON INTERACTIONS
  // ============================================

  class ButtonInteractions {
    constructor() {
      this.init();
    }

    init() {
      this.setupRippleEffect();
      this.setupMagneticEffect();
      this.setupHoverEffects();
      this.setupClickTracking();
    }

    setupRippleEffect() {
      document.querySelectorAll('.btn, button, [data-ripple]').forEach(button => {
        button.style.position = 'relative';
        button.style.overflow = 'hidden';

        button.addEventListener('click', e => {
          const ripple = document.createElement('span');
          const rect = button.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.className = 'ripple-effect';
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;

          button.appendChild(ripple);

          setTimeout(() => ripple.remove(), CONFIG.rippleDuration);

          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(10);
          }
        });
      });
    }

    setupMagneticEffect() {
      if (CONFIG.reducedMotion) {
        return;
      }

      document.querySelectorAll('[data-magnetic]').forEach(element => {
        let boundingRect = element.getBoundingClientRect();

        element.addEventListener('mouseenter', () => {
          boundingRect = element.getBoundingClientRect();
        });

        element.addEventListener('mousemove', e => {
          const x = (e.clientX - boundingRect.left - boundingRect.width / 2) * 0.3;
          const y = (e.clientY - boundingRect.top - boundingRect.height / 2) * 0.3;

          element.style.transform = `translate(${x}px, ${y}px)`;
        });

        element.addEventListener('mouseleave', () => {
          element.style.transform = '';
        });
      });
    }

    setupHoverEffects() {
      document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('mouseenter', function () {
          this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function () {
          this.style.transform = '';
        });
      });
    }

    setupClickTracking() {
      document.querySelectorAll('[data-track]').forEach(element => {
        element.addEventListener('click', () => {
          const action = element.dataset.track;

          if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
              event_category: 'engagement',
              event_label: action
            });
          }

          console.log('Tracked action:', action);
        });
      });
    }
  }

  // ============================================
  // TOUCH GESTURES
  // ============================================

  class TouchGestures {
    constructor() {
      this.touches = new Map();
      this.init();
    }

    init() {
      if (!('ontouchstart' in window)) {
        return;
      }

      this.setupSwipeGestures();
      this.setupPinchZoom();
      this.setupDoubleTap();
      this.setupLongPress();
      this.setupTouchFeedback();
    }

    setupSwipeGestures() {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }, { passive: true });

      document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const diffTime = touchEndTime - touchStartTime;

        // Quick swipe detection
        if (diffTime < 300) {
          if (Math.abs(diffX) > CONFIG.swipeThreshold && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
              document.dispatchEvent(new CustomEvent('swiperight', {
                detail: { distance: diffX, time: diffTime }
              }));
            } else {
              document.dispatchEvent(new CustomEvent('swipeleft', {
                detail: { distance: Math.abs(diffX), time: diffTime }
              }));
            }
          } else if (Math.abs(diffY) > CONFIG.swipeThreshold) {
            if (diffY > 0) {
              document.dispatchEvent(new CustomEvent('swipedown', {
                detail: { distance: diffY, time: diffTime }
              }));
            } else {
              document.dispatchEvent(new CustomEvent('swipeup', {
                detail: { distance: Math.abs(diffY), time: diffTime }
              }));
            }
          }
        }
      }, { passive: true });
    }

    setupPinchZoom() {
      let initialDistance = 0;

      document.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
          initialDistance = this.getDistance(e.touches[0], e.touches[1]);
        }
      }, { passive: true });

      document.addEventListener('touchmove', e => {
        if (e.touches.length === 2) {
          const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
          const scale = currentDistance / initialDistance;

          document.dispatchEvent(new CustomEvent('pinch', {
            detail: { scale }
          }));
        }
      }, { passive: true });
    }

    getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    setupDoubleTap() {
      let lastTap = 0;

      document.addEventListener('touchend', e => {
        const currentTime = Date.now();
        const tapLength = currentTime - lastTap;

        if (tapLength < CONFIG.doubleTapTimeout && tapLength > 0) {
          document.dispatchEvent(new CustomEvent('doubletap', {
            detail: {
              x: e.changedTouches[0].clientX,
              y: e.changedTouches[0].clientY
            }
          }));
        }

        lastTap = currentTime;
      });
    }

    setupLongPress() {
      let pressTimer = null;

      document.addEventListener('touchstart', e => {
        pressTimer = setTimeout(() => {
          document.dispatchEvent(new CustomEvent('longpress', {
            detail: {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
              target: e.target
            }
          }));
        }, CONFIG.longPressTimeout);
      });

      document.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
      });

      document.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
      });
    }

    setupTouchFeedback() {
      document.addEventListener('touchstart', e => {
        const target = e.target.closest('.touchable, button, a, .card');
        if (target) {
          target.classList.add('touch-active');
        }
      });

      document.addEventListener('touchend', () => {
        document.querySelectorAll('.touch-active').forEach(el => {
          el.classList.remove('touch-active');
        });
      });
    }
  }

  // ============================================
  // MODAL HANDLER
  // ============================================

  class ModalHandler {
    constructor() {
      this.activeModals = new Set();
      this.init();
    }

    init() {
      this.setupModalTriggers();
      this.setupModalClosers();
      this.setupBackdropClick();
      this.setupKeyboardHandling();
    }

    setupModalTriggers() {
      document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', e => {
          e.preventDefault();
          const modalId = trigger.dataset.modal;
          this.openModal(modalId);
        });
      });
    }

    setupModalClosers() {
      document.querySelectorAll('.modal-close, [data-close-modal]').forEach(closer => {
        closer.addEventListener('click', () => {
          const modal = closer.closest('.modal');
          if (modal) {
            this.closeModal(modal.id);
          }
        });
      });
    }

    setupBackdropClick() {
      document.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) {
          this.closeModal(e.target.id);
        }
      });
    }

    setupKeyboardHandling() {
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.activeModals.size > 0) {
          const lastModal = Array.from(this.activeModals).pop();
          this.closeModal(lastModal);
        }
      });
    }

    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) {
        return;
      }

      // Store current focus
      modal.dataset.lastFocus = document.activeElement.id;

      // Open modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.activeModals.add(modalId);

      // Focus management
      this.trapFocus(modal);

      // Announce to screen readers
      modal.setAttribute('aria-hidden', 'false');

      // Dispatch event
      modal.dispatchEvent(new CustomEvent('modal:open'));
    }

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) {
        return;
      }

      // Close modal
      modal.classList.remove('active');
      this.activeModals.delete(modalId);

      if (this.activeModals.size === 0) {
        document.body.style.overflow = '';
      }

      // Return focus
      const lastFocusId = modal.dataset.lastFocus;
      if (lastFocusId) {
        const lastFocusElement = document.getElementById(lastFocusId);
        if (lastFocusElement) {
          lastFocusElement.focus();
        }
      }

      // Announce to screen readers
      modal.setAttribute('aria-hidden', 'true');

      // Dispatch event
      modal.dispatchEvent(new CustomEvent('modal:close'));
    }

    trapFocus(modal) {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      firstFocusable.focus();

      modal.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      });
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        func.apply(this, args);
        lastCall = now;
      }
    };
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interaction handlers
    const formHandler = new FormHandler();
    const buttonInteractions = new ButtonInteractions();
    const touchGestures = new TouchGestures();
    const modalHandler = new ModalHandler();

    // Add interaction styles
    const style = document.createElement('style');
    style.textContent = `
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple ${CONFIG.rippleDuration}ms ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .touch-active {
                transform: scale(0.98);
                opacity: 0.8;
            }
            
            .field-feedback {
                font-size: 0.875rem;
                margin-top: 0.25rem;
                transition: all 0.3s ease;
            }
            
            .field-feedback.error {
                color: #EF4444;
            }
            
            .field-feedback.success {
                color: #10B981;
            }
            
            input.invalid,
            textarea.invalid {
                border-color: #EF4444;
            }
            
            input.valid,
            textarea.valid {
                border-color: #10B981;
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 350px;
                padding: 16px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification.fade-out {
                animation: slideOut 0.3s ease;
            }
            
            @keyframes slideOut {
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            
            .spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
    document.head.appendChild(style);

    // Expose API
    window.MaxiMax = window.MaxiMax || {};
    window.MaxiMax.interactions = {
      formHandler,
      buttonInteractions,
      touchGestures,
      modalHandler
    };

    console.log('MaxiMax Interactions initialized successfully');
  });
})();