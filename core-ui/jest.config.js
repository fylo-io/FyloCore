const nextJest = require("next/jest");
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1" // Adjust to match your project's alias
  },
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json"
      }
    ]
  },
  transformIgnorePatterns: [
    "/node_modules/(?!@xyflow/react).+\\.js$" // Allow transforming specific modules
  ]
};

module.exports = createJestConfig(customJestConfig);
