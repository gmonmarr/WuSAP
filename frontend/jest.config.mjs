// jest.config.mjs

export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  setupFiles: ['./src/setupTests.js'],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest-css-stub.js'
  }
};