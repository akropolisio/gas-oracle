module.exports = {
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],

  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['**/src/**/*.{ts}', '!**/node_modules/**'],
  coveragePathIgnorePatterns: ['.*\\.d\\.ts'],
};
