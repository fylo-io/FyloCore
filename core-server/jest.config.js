/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'], // Match test files
  moduleFileExtensions: ['js', 'ts'], // Recognize JS and TS files
  maxWorkers: 1,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Point to your tsconfig.json
    },
  },
};
