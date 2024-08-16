/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: 'unittests',
      testMatch: ['<rootDir>/src/**/*.test.js'],
    },
    {
      displayName: 'examples',
      testMatch: ['<rootDir>/examples/**/*.test.js'],
    },
  ],
};

module.exports = config;
