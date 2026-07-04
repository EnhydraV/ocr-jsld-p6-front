export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['babel-jest', { configFile: './babel.config.json' }]
  },
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFiles: ['<rootDir>/tests/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/types/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
