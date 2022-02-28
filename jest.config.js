module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],

  moduleFileExtensions: ['ts', 'js'],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ['src'],

  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['**/src/**/*.{ts}', '!**/node_modules/**'],
  coveragePathIgnorePatterns: ['.*\\.d\\.ts'],
};
