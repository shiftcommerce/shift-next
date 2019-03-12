const path = require('path')

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-transform-modules-commonjs',
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      }
    ]
  },
  externals: {
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
    'shift-react-components': 'commonjs shift-react-components',
    'getConfig': 'commonjs next/config',
    'next/router': 'commonjs next/router',
    'next/link': 'commonjs next/link',
    'react-instantsearch/server': 'react-instantsearch/server',
    'react-instantsearch/dom': 'react-instantsearch/dom',
    'stripe': 'commonjs stripe'
  }
}
