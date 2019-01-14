// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'tsx', 'js'],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // The pattern Jest uses to detect test files
  testRegex: '(/__tests__/.*|(.|/)(test|spec)).(ts|tsx|js)$',

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(ts|tsx|js)$': require.resolve('./jest/babelTransformer')
  }
}
