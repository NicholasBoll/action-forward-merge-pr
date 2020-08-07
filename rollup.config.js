import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'lib/main.js',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
    name: 'ActionForwardMergePR'
  },
  plugins: [resolve(), commonjs()]
}
