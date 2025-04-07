module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: [
    '**/tests/**/*.test.(ts|tsx|js)',
    '**/src/**/__tests__/**/*.test.(ts|tsx|js)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
