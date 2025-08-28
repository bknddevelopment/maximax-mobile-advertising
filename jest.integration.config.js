/**
 * Jest Configuration for Integration Tests
 * MaxiMax Mobile Advertising
 */

module.exports = {
  displayName: 'Integration Tests',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/integration'],
  testMatch: [
    '**/*.integration.js',
    '**/*.integration.test.js'
  ],
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
  testTimeout: 30000,
  maxWorkers: 1,
  bail: false
};