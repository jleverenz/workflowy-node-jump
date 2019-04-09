const webpack = require('webpack');
const fs = require('fs');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './src/wf-node-jump.js',
  plugins: [
    new UglifyJsPlugin(),
    new webpack.BannerPlugin({
      banner: fs.readFileSync('./src/wf-node-jump-banner.txt', 'utf8'),
      raw: true
    })
  ],
  module: {
    rules: [
      {
        use: {
          loader:'babel-loader',
          options: { presets: ['es2015'] }
        },
        test: /\.js$/
      }
    ]
  },
  output: {
    filename: 'wf-node-jump.user.js'
  }
};
