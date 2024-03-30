const path = require('path')

module.exports = {
  entry: {
    main: path.resolve(__dirname, './schema/schema.js'),
  },
  output: {
    filename: 'schema.js',
    path: path.resolve(__dirname, 'src'),
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true,
  }
}
