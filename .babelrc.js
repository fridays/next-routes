// Babel configuration used to compile the distributable library to 'dist/',
// and to compile sources (including TypeScript) for execution in Jest's environment.
// See https://babeljs.io/docs/en/config-files#file-relative-configuration

const presets = [
  require('@babel/preset-env'),
  require('next/babel')
]

// Only in the Jest environment, compile TypeScript sources
if (process.env.NODE_ENV === 'test') {
  presets.push(
    require('@zeit/next-typescript/babel')
  )
}

module.exports = {
  presets
}
