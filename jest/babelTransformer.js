/**
 * This is a custom Jest transformer used to transpile TypeScript sources using Babel.
 * See also:
 *  - https://jestjs.io/docs/en/getting-started.html#using-babel
 *  - https://jestjs.io/docs/en/tutorial-react#custom-transformers
 */

const babelJest = require('babel-jest')

module.exports = babelJest.createTransformer(require('../.babelrc'))
