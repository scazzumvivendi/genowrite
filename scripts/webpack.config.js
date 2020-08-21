const path = require('path')
const webpack = require('webpack')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

const config = {
  mode: 'development',
  entry: [
    './src/main'
  ],
  output: {
    path: path.join(__dirname, '..'),
    filename: 'genowrite.min.js'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.IgnorePlugin(new RegExp('^(xmlhttprequest|./lang)$'))
  ],
  module: {
    rules: [
      {
        test: [/\.txt$/, /\.html$/],
        loader: 'raw-loader'
      }
    ]
  },
  resolve: {
    alias: {
      'rs-adapter': path.join(__dirname, '../lib/backbone.remoteStorage-documents'),
      snap: path.join(__dirname, '../lib/snap')
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new SWPrecacheWebpackPlugin({
      cacheId: 'genowrite',
      minify: true,
      staticFileGlobs: [
        'style/genowrite.css',
        'style/*.ttf',
        'style/*.otf',
        'img/*.png',
        'img/*.svg'
      ]
    }),
    new webpack.DefinePlugin({
      'window.PRODUCTION': 'true'
    })
  )
} else {
  config.optimization = {
		// We no not want to minimize our code.
		minimize: false
	},
  config.devtool = 'cheap-module-eval-source-map'
  config.entry.unshift('webpack-hot-middleware/client')
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = config
