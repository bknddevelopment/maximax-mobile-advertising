/**
 * Form Validation Tests
 * Testing form handling, validation, and submission
 */

describe('Form Module', () => {
  let form;
  let emailInput;
  let phoneInput;
  let messageTextarea;
  let submitButton;

  beforeEach(() => {
    // Setup form HTML
    document.body.innerHTML = `
      <form id="contactForm" class="contact-form">
        <div class="form-group">
          <input type="email" id="email" name="email" class="form-input" required placeholder="Email">
        </div>
        <div class="form-group">
          <input type="tel" id="phone" name="phone" class="form-input" required placeholder="Phone">
        </div>
        <div class="form-group">
          <textarea id="message" name="message" class="form-input" required maxlength="500" placeholder="Message"></textarea>
        </div>
        <button type="submit" class="submit-btn">Send Message</button>
      </form>
    `;

    form = document.getElementById('contactForm');
    emailInput = document.getElementById('email');
    phoneInput = document.getElementById('phone');
    messageTextarea = document.getElementById('message');
    submitButton = document.querySelector('.submit-btn');

    // Clear fetch mocks
    fetch.resetMocks();
  });

  describe('Field Validation', () => {
    describe('Email Validation', () => {
      test('should validate correct email formats', () => {
        const validEmails = [
          'user@example.com',
          'test.user@domain.co.uk',
          'user+tag@example.org',
          'user_123@test-domain.com'
        ];

        validEmails.forEach(email => {
          emailInput.value = email;
          emailInput.dispatchEvent(new Event('blur'));
          expect(emailInput.classList.contains('valid')).toBe(true);
          expect(emailInput.classList.contains('invalid')).toBe(false);
        });
      });

      test('should invalidate incorrect email formats', () => {
        const invalidEmails = [
          'notanemail',
          '@example.com',
          'user@',
          'user @example.com',
          'user@.com',
          'user..name@example.com'
        ];

        invalidEmails.forEach(email => {
          emailInput.value = email;
          emailInput.dispatchEvent(new Event('blur'));
          expect(emailInput.classList.contains('invalid')).toBe(true);
          expect(emailInput.classList.contains('valid')).toBe(false);
        });
      });

      test('should show error message for invalid email', () => {
        emailInput.value = 'invalid-email';
        emailInput.dispatchEvent(new Event('blur'));

        const errorElement = emailInput.parentElement.querySelector('.field-error');
        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent).toBe('Please enter a valid email');
        expect(errorElement.getAttribute('role')).toBe('alert');
      });

      test('should perform live validation on input', done => {
        emailInput.value = 'test@';
        emailInput.dispatchEvent(new Event('input'));

        // Wait for debounce
        setTimeout(() => {
          expect(emailInput.classList.contains('invalid')).toBe(true);

          // Now make it valid
          emailInput.value = 'test@example.com';
          emailInput.dispatchEvent(new Event('input'));

          setTimeout(() => {
            expect(emailInput.classList.contains('valid')).toBe(true);
            expect(emailInput.classList.contains('invalid')).toBe(false);
            done();
          }, 600);
        }, 600);
      });
    });

    describe('Phone Validation', () => {
      test('should validate correct phone formats', () => {
        const validPhones = [
          '1234567890',
          '123-456-7890',
          '(123) 456-7890',
          '+1 123-456-7890',
          '123 456 7890'
        ];

        validPhones.forEach(phone => {
          phoneInput.value = phone;
          phoneInput.dispatchEvent(new Event('blur'));
          expect(phoneInput.classList.contains('valid')).toBe(true);
          expect(phoneInput.classList.contains('invalid')).toBe(false);
        });
      });

      test('should invalidate incorrect phone formats', () => {
        const invalidPhones = [
          '123',
          'abcdefghij',
          '12 34 56',
          '123-456'
        ];

        invalidPhones.forEach(phone => {
          phoneInput.value = phone;
          phoneInput.dispatchEvent(new Event('blur'));
          expect(phoneInput.classList.contains('invalid')).toBe(true);
        });
      });

      test('should show error message for invalid phone', () => {
        phoneInput.value = '123';
        phoneInput.dispatchEvent(new Event('blur'));

        const errorElement = phoneInput.parentElement.querySelector('.field-error');
        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent).toBe('Please enter a valid phone number');
      });
    });

    describe('Required Field Validation', () => {
      test('should mark empty required fields as invalid', () => {
        emailInput.value = '';
        emailInput.dispatchEvent(new Event('blur'));

        expect(emailInput.classList.contains('invalid')).toBe(true);
        const errorElement = emailInput.parentElement.querySelector('.field-error');
        expect(errorElement.textContent).toBe('This field is required');
      });

      test('should clear error when field is filled', () => {
        // First make it invalid
        emailInput.value = '';
        emailInput.dispatchEvent(new Event('blur'));
        expect(emailInput.classList.contains('invalid')).toBe(true);

        // Now fill it correctly
        emailInput.value = 'test@example.com';
        emailInput.dispatchEvent(new Event('blur'));

        expect(emailInput.classList.contains('invalid')).toBe(false);
        expect(emailInput.classList.contains('valid')).toBe(true);
        const errorElement = emailInput.parentElement.querySelector('.field-error');
        expect(errorElement).toBeFalsy();
      });
    });
  });

  describe('Character Counter', () => {
    test('should display character counter for textarea', () => {
      messageTextarea.dispatchEvent(new Event('focus'));
      const counter = messageTextarea.parentElement.querySelector('.char-counter');

      expect(counter).toBeTruthy();
      expect(counter.textContent).toBe('0 / 500');
    });

    test('should update counter as user types', () => {
      messageTextarea.dispatchEvent(new Event('focus'));
      const counter = messageTextarea.parentElement.querySelector('.char-counter');

      messageTextarea.value = 'Hello World';
      messageTextarea.dispatchEvent(new Event('input'));

      expect(counter.textContent).toBe('11 / 500');
    });

    test('should warn when approaching limit', () => {
      messageTextarea.dispatchEvent(new Event('focus'));
      const counter = messageTextarea.parentElement.querySelector('.char-counter');

      // Fill to 80% capacity (400 chars)
      messageTextarea.value = 'a'.repeat(401);
      messageTextarea.dispatchEvent(new Event('input'));

      expect(counter.style.color).toContain('EC008C'); // Warning color
    });
  });

  describe('Form Submission', () => {
    test('should prevent submission with invalid fields', () => {
      const preventDefaultSpy = jest.fn();
      const submitEvent = new Event('submit', { cancelable: true });
      submitEvent.preventDefault = preventDefaultSpy;

      // Leave fields empty
      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should validate all fields before submission', () => {
      const preventDefaultSpy = jest.fn();
      const submitEvent = new Event('submit', { cancelable: true });
      submitEvent.preventDefault = preventDefaultSpy;

      // Fill with invalid data
      emailInput.value = 'invalid';
      phoneInput.value = '123';
      messageTextarea.value = 'Test';

      form.dispatchEvent(submitEvent);

      expect(emailInput.classList.contains('invalid')).toBe(true);
      expect(phoneInput.classList.contains('invalid')).toBe(true);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should focus first invalid field on failed submission', () => {
      emailInput.focus = jest.fn();

      // Leave email empty
      emailInput.value = '';
      phoneInput.value = '1234567890';
      messageTextarea.value = 'Test message';

      form.dispatchEvent(new Event('submit'));

      expect(emailInput.focus).toHaveBeenCalled();
    });

    test('should show loading state during submission', async () => {
      // Fill valid data
      emailInput.value = 'test@example.com';
      phoneInput.value = '1234567890';
      messageTextarea.value = 'Test message';

      // Mock successful API response
      fetch.mockResponseOnce(JSON.stringify({ success: true }));

      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Check loading state
      expect(submitButton.disabled).toBe(true);
      expect(submitButton.classList.contains('loading')).toBe(true);
      expect(submitButton.innerHTML).toContain('Sending...');

      // Wait for submission to complete
      await new Promise(resolve => setTimeout(resolve, 2100));

      // Check success state
      expect(submitButton.classList.contains('success')).toBe(true);
      expect(submitButton.innerHTML).toContain('Sent Successfully');
    });

    test('should reset form after successful submission', async () => {
      // Fill form
      emailInput.value = 'test@example.com';
      phoneInput.value = '1234567890';
      messageTextarea.value = 'Test message';

      fetch.mockResponseOnce(JSON.stringify({ success: true }));

      form.dispatchEvent(new Event('submit'));

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 3100));

      expect(emailInput.value).toBe('');
      expect(phoneInput.value).toBe('');
      expect(messageTextarea.value).toBe('');
      expect(submitButton.disabled).toBe(false);
      expect(submitButton.classList.contains('success')).toBe(false);
    });

    test('should handle submission errors gracefully', async () => {
      emailInput.value = 'test@example.com';
      phoneInput.value = '1234567890';
      messageTextarea.value = 'Test message';

      // Mock API error
      fetch.mockRejectOnce(new Error('Network error'));

      form.dispatchEvent(new Event('submit'));

      await new Promise(resolve => setTimeout(resolve, 2100));

      // Should show error notification
      const notification = document.querySelector('.notification-error');
      expect(notification).toBeTruthy();
    });
  });

  describe('Float Label Animation', () => {
    test('should add focused class on input focus', () => {
      emailInput.dispatchEvent(new Event('focus'));
      expect(emailInput.parentElement.classList.contains('focused')).toBe(true);
    });

    test('should remove focused class on blur if empty', () => {
      emailInput.dispatchEvent(new Event('focus'));
      emailInput.dispatchEvent(new Event('blur'));
      expect(emailInput.parentElement.classList.contains('focused')).toBe(false);
    });

    test('should keep focused class on blur if has value', () => {
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('focus'));
      emailInput.dispatchEvent(new Event('blur'));
      expect(emailInput.parentElement.classList.contains('focused')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes for errors', () => {
      emailInput.value = 'invalid';
      emailInput.dispatchEvent(new Event('blur'));

      const errorElement = emailInput.parentElement.querySelector('.field-error');
      expect(errorElement.getAttribute('role')).toBe('alert');
    });

    test('should announce form submission status', async () => {
      // Setup valid form
      emailInput.value = 'test@example.com';
      phoneInput.value = '1234567890';
      messageTextarea.value = 'Test message';

      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      form.dispatchEvent(new Event('submit'));

      await new Promise(resolve => setTimeout(resolve, 2100));

      const notification = document.querySelector('[role="alert"]');
      expect(notification).toBeTruthy();
      expect(notification.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Performance', () => {
    test('should debounce live validation', done => {
      const validationSpy = jest.fn();
      emailInput.addEventListener('input', validationSpy);

      // Trigger multiple input events rapidly
      for (let i = 0; i < 10; i++) {
        emailInput.value = `test${i}`;
        emailInput.dispatchEvent(new Event('input'));
      }

      // Check immediately - should be called for each input
      expect(validationSpy).toHaveBeenCalledTimes(10);

      // But actual validation should be debounced
      setTimeout(() => {
        // Only the last validation should have executed
        expect(emailInput.classList.contains('invalid')).toBe(true);
        done();
      }, 600);
    });

    test('should handle large form data efficiently', () => {
      // Create a large form with many fields
      const largeForm = document.createElement('form');
      for (let i = 0; i < 100; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.name = `field${i}`;
        input.value = `value${i}`;
        largeForm.appendChild(input);
      }
      document.body.appendChild(largeForm);

      const formData = new FormData(largeForm);
      const data = Object.fromEntries(formData.entries());

      expect(Object.keys(data).length).toBe(100);
      expect(data.field50).toBe('value50');
    });
  });

  describe('Edge Cases', () => {
    test('should handle form without submit button', () => {
      const formWithoutButton = document.createElement('form');
      formWithoutButton.innerHTML = '<input type="text" required>';
      document.body.appendChild(formWithoutButton);

      expect(() => {
        formWithoutButton.dispatchEvent(new Event('submit'));
      }).not.toThrow();
    });

    test('should handle special characters in input', () => {
      const specialChars = '<script>alert("XSS")</script>';
      messageTextarea.value = specialChars;
      messageTextarea.dispatchEvent(new Event('blur'));

      // Should not execute script
      expect(window.alert).not.toHaveBeenCalled();
    });

    test('should trim whitespace from inputs', () => {
      emailInput.value = '  test@example.com  ';
      emailInput.dispatchEvent(new Event('blur'));

      expect(emailInput.classList.contains('valid')).toBe(true);
    });

    test('should handle rapid form submissions', () => {
      emailInput.value = 'test@example.com';
      phoneInput.value = '1234567890';
      messageTextarea.value = 'Test';

      // Submit multiple times rapidly
      for (let i = 0; i < 5; i++) {
        form.dispatchEvent(new Event('submit'));
      }

      // Should only process once while disabled
      expect(submitButton.disabled).toBe(true);
    });
  });
});