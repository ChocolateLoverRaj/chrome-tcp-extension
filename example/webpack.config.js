const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const { ProvidePlugin } = require('webpack')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './index.tsx',
  devtool: 'source-map',
  devServer: {
    hot: false
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.join(__dirname, './index.html') }),
    new ProvidePlugin({
      process: 'process/browser'
    }),
    ...isProduction
      ? []
      : [new ReactRefreshPlugin()]
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react', '@babel/typescript'],
            plugins: [
              'react-require',
              ...isProduction ? [] : ['react-refresh/babel']
            ]
          }
        }],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      assert: require.resolve('assert-browserify')
    }
  }
}
