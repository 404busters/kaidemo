'use strict';

const UglifyPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OccurenceOrderPlugin = require('webpack/lib/optimize/OccurrenceOrderPlugin');
const DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  plugins: [
    new OccurenceOrderPlugin(),
    new DedupePlugin()
  ],
  external: {

  },
  devtool: 'source-map',
  entry: {
    app: ['./assets/js/index.jsx']
  },
  output: {
    path: `${__dirname}/public/js`,
    publicPath: '/js',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.jsx', '.js', '.json'],
    fallback: ['node_modules']
  },
  resolveLoader: {
    fallback: ['node_modules']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel']
      }
    ]
  }
};
