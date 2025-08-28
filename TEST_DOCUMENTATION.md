# Test Documentation - MaxiMax Mobile Advertising

## Overview
This document provides comprehensive documentation for the test suite of the MaxiMax Mobile Advertising website. Our testing strategy ensures WCAG AAA compliance, cross-browser compatibility, and optimal performance.

## Test Suite Architecture

### 1. Unit Tests (Jest)
- **Location**: `/tests/unit/`
- **Config**: `jest.config.js`
- **Coverage Target**: 80% minimum
- **Run**: `npm run test:unit`

#### Test Coverage:
- Navigation functionality
- Form validation and submission
- Animation controllers
- Utility functions
- State management
- Event handlers

### 2. Integration Tests (Jest)
- **Location**: `/tests/integration/`
- **Config**: `jest.integration.config.js`
- **Run**: `npm run test:integration`

#### Test Coverage:
- Component interactions
- API integrations
- Data flow between modules
- Service boundaries

### 3. E2E Tests (Playwright)
- **Location**: `/tests/e2e/`
- **Config**: `playwright.config.js`
- **Run**: `npm run test:e2e`

#### Test Coverage:
- Homepage user flows
- Navigation scenarios
- Form submissions
- Cross-browser compatibility
- Mobile responsiveness
- Performance metrics
- Accessibility compliance

### 4. Accessibility Tests (Pa11y & Axe)
- **Config**: `.pa11yci`
- **Standard**: WCAG AAA
- **Run**: `npm run test:accessibility`

#### Test Coverage:
- Color contrast (7:1 ratio minimum)
- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA labels and roles
- Touch target sizes (44x44px minimum)

### 5. Performance Tests (Lighthouse)
- **Config**: `lighthouserc.js`
- **Run**: `npm run test:lighthouse`

#### Performance Targets:
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- FCP: < 1.8s
- TTFB: < 600ms

## Running Tests

### Quick Start
```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:e2e           # E2E tests only
npm run test:accessibility # Accessibility tests
npm run test:lighthouse    # Performance tests
```

### Development Mode
```bash
# Watch mode for unit tests
npm run test:watch

# Run E2E tests with UI
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

## Browser Coverage

### Desktop Browsers
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari/WebKit (latest)
- Microsoft Edge (latest)

### Mobile Browsers
- iOS Safari (iPhone 13)
- Chrome Mobile (Pixel 5)
- Samsung Internet

### Tablets
- iPad Safari
- Android Chrome

## CI/CD Pipeline

### GitHub Actions Workflow
- **File**: `.github/workflows/test.yml`
- **Triggers**: Push to main/develop, Pull requests
- **Jobs**:
  1. Unit Tests (Node 18.x, 20.x)
  2. Integration Tests
  3. E2E Tests (all browsers)
  4. Accessibility Tests
  5. Lighthouse Performance Tests
  6. Security Scanning
  7. Build Validation

### Test Reports
- Coverage reports: `/coverage/`
- Playwright reports: `/playwright-report/`
- Lighthouse reports: `/.lighthouseci/`
- Screenshots: `/test-results/`

## Key Test Scenarios

### Critical User Paths
1. **Homepage Loading**
   - Hero section visibility
   - CTA functionality
   - Navigation menu

2. **Mobile Navigation**
   - Hamburger menu toggle
   - Touch gestures
   - Responsive layout

3. **Form Submission**
   - Field validation
   - Error messages
   - Success notifications
   - Accessibility compliance

4. **Performance**
   - Page load time < 3s
   - Smooth scrolling
   - Animation performance
   - Resource optimization

### Accessibility Requirements
- **Level AAA Compliance**:
  - Enhanced color contrast (7:1)
  - Comprehensive keyboard navigation
  - Multiple ways to find content
  - Context-sensitive help
  - Error prevention
  - Reading level consideration

## Test Maintenance

### Best Practices
1. Keep tests isolated and independent
2. Use page object pattern for E2E tests
3. Mock external dependencies
4. Maintain test data fixtures
5. Regular dependency updates
6. Document flaky tests

### Debugging Failed Tests
```bash
# View test output
npm run test:unit -- --verbose

# Run specific test file
npm run test:unit -- navigation.test.js

# Generate coverage report
npm run test:coverage

# View Playwright trace
npx playwright show-trace trace.zip
```

## Quality Metrics

### Current Status
- **Unit Test Coverage**: Target 80%+
- **E2E Test Coverage**: All critical paths
- **Accessibility Score**: WCAG AAA compliant
- **Performance Score**: 90+ (Lighthouse)
- **Browser Support**: 99%+ users

### Monitoring
- Automated CI/CD runs on every commit
- Weekly security audits
- Monthly dependency updates
- Quarterly test suite review

## Known Issues and Limitations

### Current Limitations
1. Visual regression testing not yet implemented
2. Load testing infrastructure pending
3. Internationalization testing not required

### Future Enhancements
- [ ] Add Percy for visual regression testing
- [ ] Implement load testing with K6
- [ ] Add mutation testing
- [ ] Enhance mobile gesture testing

## Support and Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)

### Troubleshooting
For test-related issues:
1. Check test logs in CI/CD
2. Review error screenshots
3. Verify local environment setup
4. Consult test documentation

## Version History
- v1.0.0 - Initial test suite implementation
- Comprehensive coverage for all features
- WCAG AAA compliance verified
- Cross-browser compatibility confirmed