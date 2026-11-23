module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/dist/src/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  clearMocks: true
};
