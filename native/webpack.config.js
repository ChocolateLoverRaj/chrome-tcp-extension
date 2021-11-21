const { join } = require('path')

module.exports = {
  mode: 'none',
  entry: {
    native: './native',
    setupNative: './setupNative'
  },
  output: {
    path: join(__dirname, '../dist/native'),
    filename: '[name].js'
  },
  target: 'node',
  optimization: {
    splitChunks: {
      minSize: 0,
      chunks: 'all'
    }
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
}
