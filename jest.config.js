/**
 * Jest Configuration for Unit Tests
 * MaxiMax Mobile Advertising
 */

module.exports = {
  displayName: 'Unit Tests',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/unit'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.min.js',
    '!js/**/*.test.js',
    '!js/**/*.spec.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.js$': ['babel-jest', {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
    }]
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  testTimeout: 10000,
  maxWorkers: '50%',
  bail: false,
  errorOnDeprecated: true,
  watchPathIgnorePatterns: ['node_modules', '.git', 'coverage', 'dist'],
  globals: {
    CONFIG: {
      scrollOffset: 80,
      animationDuration: 300,
      debounceDelay: 150
    }
  }
};