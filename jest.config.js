module.exports = {
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/*.spec.(js|jsx|ts|tsx)'],
  transformIgnorePatterns: ['node_modules/(?!(babel-jest)/)'],
}
