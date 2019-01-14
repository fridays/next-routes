// Babel configuration used to compile the distributable library to 'dist/',
// and to compile sources (including TypeScript) for execution in Jest's environment.
// See https://babeljs.io/docs/en/config-files#file-relative-configuration

module.exports = {
  presets: [
    require('@babel/preset-env'),
    require('next/babel')
  ]
}
