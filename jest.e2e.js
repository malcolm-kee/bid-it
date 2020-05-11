/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: ['apps\\/.*\\.e2e-spec.ts$'],
  collectCoverageFrom: ['apps/**/*.ts', 'libs/**/*.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>\\/.*.spec.ts$',
    '<rootDir>\\/.*\\/main.ts$',
    '<rootDir>\\/.*\\/app.module.ts$',
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '@app/deal-data/(.*)': '<rootDir>/libs/deal-data/src/$1',
    '@app/deal-data': '<rootDir>/libs/deal-data/src',
    '@app/const/(.*)': '<rootDir>/libs/const/src/$1',
    '@app/const': '<rootDir>/libs/const/src',
  },
};
