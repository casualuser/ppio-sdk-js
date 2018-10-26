// rollup config
import pkg from './package.json'

export default [
  {
    input: './index.js',
    external: ['jayson', 'request-promise'],
    output: [{ file: pkg.main, format: 'cjs' }],
  },
]
