export default {
  input: 'src/index.js',
  output: {
    file: 'src/index.cjs',
    format: 'cjs',
    exports: 'named'
  },
  external: ['ajv', 'ajv-formats', 'node:fs/promises']
}
