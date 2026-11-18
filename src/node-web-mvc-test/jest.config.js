/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [ '<rootDir>/src' ],
  testMatch: [ '**/*.spec.ts' ],
  moduleNameMapper: {
    '^node-web-mvc$': '<rootDir>/../node-web-mvc/src/index.ts',
    '^node-web-mvc-starter$': '<rootDir>/../node-web-mvc-starter/src/index.ts',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleFileExtensions: [ 'ts', 'js', 'json' ],
  collectCoverageFrom: [
    '../node-web-mvc/src/**/*.ts',
    '!../node-web-mvc/src/**/index.ts',
    '!../node-web-mvc/src/**/*.d.ts',
  ],
};
