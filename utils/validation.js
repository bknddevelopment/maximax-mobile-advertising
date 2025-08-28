/**
 * MaxiMax Mobile Advertising - Validation Utilities
 * @version 3.0.0
 * @description Comprehensive validation utilities for forms, API requests, and data integrity
 */

/**
 * Validation Rules and Patterns
 */
const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  zipCode: /^[0-9]{5}(-[0-9]{4})?$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^[0-9]+$/,
  decimal: /^[0-9]+(\.[0-9]{1,2})?$/,
  creditCard: /^[0-9]{13,19}$/,
  cvv: /^[0-9]{3,4}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

/**
 * Validation Error Messages
 */
const ERROR_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  zipCode: 'Please enter a valid ZIP code',
  url: 'Please enter a valid URL',
  minLength: 'Must be at least {min} characters',
  maxLength: 'Must not exceed {max} characters',
  minValue: 'Must be at least {min}',
  maxValue: 'Must not exceed {max}',
  pattern: 'Please enter a valid format',
  match: 'Fields do not match',
  unique: 'This value already exists',
  date: 'Please enter a valid date',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
  creditCard: 'Please enter a valid credit card number',
  strongPassword: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
};

/**
 * Main Validator Class
 */
export class Validator {
  constructor(data = {}, rules = {}) {
    this.data = data;
    this.rules = rules;
    this.errors = {};
    this.validated = false;
  }

  /**
     * Validate all fields
     */
  validate() {
    this.errors = {};

    for (const [field, rules] of Object.entries(this.rules)) {
      const value = this.getNestedValue(this.data, field);
      const fieldErrors = this.validateField(value, rules, field);

      if (fieldErrors.length > 0) {
        this.errors[field] = fieldErrors;
      }
    }

    this.validated = true;
    return this.isValid();
  }

  /**
     * Validate single field
     */
  validateField(value, rules, fieldName) {
    const errors = [];

    // Parse rules if string
    if (typeof rules === 'string') {
      rules = this.parseRules(rules);
    }

    // Check each rule
    for (const rule of rules) {
      const error = this.checkRule(value, rule, fieldName);
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  /**
     * Check individual rule
     */
  checkRule(value, rule, fieldName) {
    const { type, params } = typeof rule === 'string' ? { type: rule, params: {} } : rule;

    switch (type) {
      case 'required':
        if (!this.isRequired(value)) {
          return this.formatError(ERROR_MESSAGES.required, { field: fieldName });
        }
        break;

      case 'email':
        if (value && !this.isEmail(value)) {
          return this.formatError(ERROR_MESSAGES.email, { field: fieldName });
        }
        break;

      case 'phone':
        if (value && !this.isPhone(value)) {
          return this.formatError(ERROR_MESSAGES.phone, { field: fieldName });
        }
        break;

      case 'zipCode':
        if (value && !this.isZipCode(value)) {
          return this.formatError(ERROR_MESSAGES.zipCode, { field: fieldName });
        }
        break;

      case 'url':
        if (value && !this.isURL(value)) {
          return this.formatError(ERROR_MESSAGES.url, { field: fieldName });
        }
        break;

      case 'minLength':
        if (value && !this.minLength(value, params.min || params)) {
          return this.formatError(ERROR_MESSAGES.minLength, { min: params.min || params });
        }
        break;

      case 'maxLength':
        if (value && !this.maxLength(value, params.max || params)) {
          return this.formatError(ERROR_MESSAGES.maxLength, { max: params.max || params });
        }
        break;

      case 'minValue':
        if (value !== undefined && !this.minValue(value, params.min || params)) {
          return this.formatError(ERROR_MESSAGES.minValue, { min: params.min || params });
        }
        break;

      case 'maxValue':
        if (value !== undefined && !this.maxValue(value, params.max || params)) {
          return this.formatError(ERROR_MESSAGES.maxValue, { max: params.max || params });
        }
        break;

      case 'pattern':
        if (value && !this.matchesPattern(value, params.pattern || params)) {
          return this.formatError(ERROR_MESSAGES.pattern, { field: fieldName });
        }
        break;

      case 'match':
        const matchValue = this.getNestedValue(this.data, params.field || params);
        if (value && value !== matchValue) {
          return this.formatError(ERROR_MESSAGES.match, { field: fieldName });
        }
        break;

      case 'date':
        if (value && !this.isDate(value)) {
          return this.formatError(ERROR_MESSAGES.date, { field: fieldName });
        }
        break;

      case 'futureDate':
        if (value && !this.isFutureDate(value)) {
          return this.formatError(ERROR_MESSAGES.futureDate, { field: fieldName });
        }
        break;

      case 'pastDate':
        if (value && !this.isPastDate(value)) {
          return this.formatError(ERROR_MESSAGES.pastDate, { field: fieldName });
        }
        break;

      case 'creditCard':
        if (value && !this.isCreditCard(value)) {
          return this.formatError(ERROR_MESSAGES.creditCard, { field: fieldName });
        }
        break;

      case 'strongPassword':
        if (value && !this.isStrongPassword(value)) {
          return this.formatError(ERROR_MESSAGES.strongPassword, { field: fieldName });
        }
        break;

      case 'custom':
        if (params.validator && !params.validator(value, this.data)) {
          return this.formatError(params.message || 'Validation failed', { field: fieldName });
        }
        break;
    }

    return null;
  }

  /**
     * Validation methods
     */
  isRequired(value) {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    return true;
  }

  isEmail(value) {
    return VALIDATION_PATTERNS.email.test(value);
  }

  isPhone(value) {
    return VALIDATION_PATTERNS.phone.test(value.replace(/\s/g, ''));
  }

  isZipCode(value) {
    return VALIDATION_PATTERNS.zipCode.test(value);
  }

  isURL(value) {
    return VALIDATION_PATTERNS.url.test(value);
  }

  minLength(value, min) {
    return value.length >= min;
  }

  maxLength(value, max) {
    return value.length <= max;
  }

  minValue(value, min) {
    return Number(value) >= min;
  }

  maxValue(value, max) {
    return Number(value) <= max;
  }

  matchesPattern(value, pattern) {
    if (typeof pattern === 'string') {
      pattern = new RegExp(pattern);
    }
    return pattern.test(value);
  }

  isDate(value) {
    if (!VALIDATION_PATTERNS.date.test(value)) {
      return false;
    }
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  }

  isFutureDate(value) {
    const date = new Date(value);
    return date > new Date();
  }

  isPastDate(value) {
    const date = new Date(value);
    return date < new Date();
  }

  isCreditCard(value) {
    const cleaned = value.replace(/\s/g, '');
    if (!VALIDATION_PATTERNS.creditCard.test(cleaned)) {
      return false;
    }
    return this.luhnCheck(cleaned);
  }

  isStrongPassword(value) {
    return VALIDATION_PATTERNS.strongPassword.test(value);
  }

  /**
     * Luhn algorithm for credit card validation
     */
  luhnCheck(value) {
    let sum = 0;
    let isEven = false;

    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
     * Helper methods
     */
  parseRules(rulesString) {
    return rulesString.split('|').map(rule => {
      const [type, ...params] = rule.split(':');
      if (params.length === 0) {
        return type;
      }
      return { type, params: params[0] };
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  formatError(message, params = {}) {
    return message.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
  }

  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  getErrors() {
    return this.errors;
  }

  getFirstError(field) {
    return this.errors[field]?.[0] || null;
  }
}

/**
 * Form Validator Class
 */
export class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.fields = {};
    this.errors = {};
    this.setupValidation();
  }

  /**
     * Setup form validation
     */
  setupValidation() {
    if (!this.form) {
      return;
    }

    // Get all form fields
    const inputs = this.form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      const name = input.name || input.id;
      if (name) {
        this.fields[name] = input;

        // Add validation on blur
        input.addEventListener('blur', () => this.validateField(name));

        // Add live validation for certain types
        if (input.type === 'email' || input.type === 'tel') {
          input.addEventListener('input', this.debounce(() => this.validateField(name), 500));
        }
      }
    });

    // Handle form submission
    this.form.addEventListener('submit', e => this.handleSubmit(e));
  }

  /**
     * Validate individual field
     */
  validateField(fieldName) {
    const field = this.fields[fieldName];
    if (!field) {
      return true;
    }

    const value = field.value.trim();
    const rules = this.getFieldRules(field);

    // Create validator
    const validator = new Validator(
      { [fieldName]: value },
      { [fieldName]: rules }
    );

    validator.validate();

    if (validator.isValid()) {
      this.removeError(fieldName);
      this.addSuccess(fieldName);
      return true;
    } else {
      const error = validator.getFirstError(fieldName);
      this.showError(fieldName, error);
      return false;
    }
  }

  /**
     * Get field validation rules
     */
  getFieldRules(field) {
    const rules = [];

    // Required
    if (field.required || field.dataset.required) {
      rules.push('required');
    }

    // Type-based rules
    switch (field.type) {
      case 'email':
        rules.push('email');
        break;
      case 'tel':
        rules.push('phone');
        break;
      case 'url':
        rules.push('url');
        break;
      case 'number':
        if (field.min !== undefined) {
          rules.push({ type: 'minValue', params: { min: field.min } });
        }
        if (field.max !== undefined) {
          rules.push({ type: 'maxValue', params: { max: field.max } });
        }
        break;
    }

    // Length rules
    if (field.minLength) {
      rules.push({ type: 'minLength', params: { min: field.minLength } });
    }
    if (field.maxLength) {
      rules.push({ type: 'maxLength', params: { max: field.maxLength } });
    }

    // Pattern rule
    if (field.pattern) {
      rules.push({ type: 'pattern', params: { pattern: field.pattern } });
    }

    // Custom rules from data attributes
    if (field.dataset.validate) {
      const customRules = field.dataset.validate.split('|');
      rules.push(...customRules);
    }

    return rules;
  }

  /**
     * Show field error
     */
  showError(fieldName, message) {
    const field = this.fields[fieldName];
    if (!field) {
      return;
    }

    // Remove previous states
    field.classList.remove('valid', 'success');
    field.classList.add('invalid', 'error');

    // Remove existing error message
    this.removeError(fieldName);

    // Create error element
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error validation-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    errorElement.style.cssText = `
            color: #EC008C;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
            animation: slideDown 0.2s ease;
        `;

    // Insert error after field
    field.parentNode.insertBefore(errorElement, field.nextSibling);

    this.errors[fieldName] = message;
  }

  /**
     * Remove field error
     */
  removeError(fieldName) {
    const field = this.fields[fieldName];
    if (!field) {
      return;
    }

    field.classList.remove('invalid', 'error');

    const errorElement = field.parentNode.querySelector('.validation-error');
    if (errorElement) {
      errorElement.remove();
    }

    delete this.errors[fieldName];
  }

  /**
     * Add success state
     */
  addSuccess(fieldName) {
    const field = this.fields[fieldName];
    if (!field) {
      return;
    }

    field.classList.add('valid', 'success');
  }

  /**
     * Handle form submission
     */
  handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    for (const fieldName in this.fields) {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    }

    if (!isValid) {
      // Focus first error field
      const firstError = this.form.querySelector('.invalid');
      if (firstError) {
        firstError.focus();
      }

      // Dispatch validation failed event
      this.form.dispatchEvent(new CustomEvent('validationFailed', {
        detail: { errors: this.errors }
      }));

      return false;
    }

    // Dispatch validation success event
    this.form.dispatchEvent(new CustomEvent('validationSuccess', {
      detail: { data: this.getFormData() }
    }));

    return true;
  }

  /**
     * Get form data
     */
  getFormData() {
    const formData = new FormData(this.form);
    return Object.fromEntries(formData.entries());
  }

  /**
     * Debounce helper
     */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
     * Reset form validation
     */
  reset() {
    this.errors = {};

    for (const fieldName in this.fields) {
      this.removeError(fieldName);
      this.fields[fieldName].classList.remove('valid', 'success');
    }
  }
}

/**
 * API Request Validator
 */
export class APIValidator {
  /**
     * Validate API request
     */
  static validateRequest(data, schema) {
    const validator = new Validator(data, schema);
    validator.validate();

    if (!validator.isValid()) {
      throw new ValidationError('Validation failed', validator.getErrors());
    }

    return true;
  }

  /**
     * Sanitize input data
     */
  static sanitize(data) {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitize(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
     * Sanitize string input
     */
  static sanitizeString(str) {
    // Remove HTML tags
    str = str.replace(/<[^>]*>/g, '');

    // Escape special characters
    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;'
    };

    return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  /**
     * Validate and sanitize email
     */
  static validateEmail(email) {
    const sanitized = email.toLowerCase().trim();

    if (!VALIDATION_PATTERNS.email.test(sanitized)) {
      throw new ValidationError('Invalid email format');
    }

    return sanitized;
  }

  /**
     * Validate and format phone number
     */
  static validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');

    if (!VALIDATION_PATTERNS.phone.test(phone)) {
      throw new ValidationError('Invalid phone number');
    }

    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  }

  /**
     * Validate date range
     */
  static validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new ValidationError('Invalid date format');
    }

    if (start >= end) {
      throw new ValidationError('End date must be after start date');
    }

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
}

/**
 * Custom Validation Error
 */
export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Export validation utilities
 */
export default {
  Validator,
  FormValidator,
  APIValidator,
  ValidationError,
  patterns: VALIDATION_PATTERNS,
  messages: ERROR_MESSAGES
};