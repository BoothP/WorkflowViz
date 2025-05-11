module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    // Add any module name mappings here if needed, e.g., for path aliases
    // '@/(.*)': '<rootDir>/src/$1'
  },
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
};
