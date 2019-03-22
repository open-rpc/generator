const os = require("os");

module.exports = {
  clearMocks: true,
  coverageDirectory: '../coverage',
  resetMocks: true,
  restoreMocks: true,
  rootDir: './src',
  testEnvironment: 'node',
  preset: 'ts-jest'
};
