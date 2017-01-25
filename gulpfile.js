'use strict';

const gulp = require('gulp-help')(require('gulp'));
const util = require('gulp-util');

const sass = require('gulp-sass');
const cleanCss = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');

const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.config');
const fs = require('fs');

const WebpackDevServer = require('webpack-dev-server');

gulp.task('blob', 'Copy file to public', () => {
  return gulp.src('./assets/blob/**/*.*')
    .pipe(gulp.dest('public'));
});

gulp.task('dev:html', 'Build html page for developement', () => {
  return gulp.src('./assets/html/**/*.html')
    .pipe(gulp.dest('public'));
});

gulp.task('build:html', 'Build html page for production', () => {
  return gulp.src('./assets/html/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('dev:css', 'Build ./assets/scss/*.scss into ./public for development', () => {
  return gulp.src('./assets/scss/**/*.scss')
    .pipe(sass())
    .on('error', util.log)
    .pipe(gulp.dest('public'));
});

gulp.task('build:css', 'Build scss files into public for production', () => {
  return gulp.src('./assets/scss/**/*.scss')
    .pipe(sass())
    .on('error', util.log)
    .pipe(cleanCss())
    .pipe(gulp.dest('public'));
});

gulp.task('server', 'Start a webpack-dev-server for the project at http://localhost:8080', () => {
  const devConfig = merge.smart({
    entry: {
      app: [
        'webpack-dev-server/client?http://localhost:8080/',
      ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        loaders: [
            {test: /\.jsx?/, loaders: ['react-hot']}
        ]
    }
  }, config);

  const compiler = webpack(devConfig);
  compiler.plugin('done', (stats) => {
    fs.writeFile('./webpack.json', JSON.stringify(stats.toJson('verbose')));
  });

  const server = new WebpackDevServer(compiler, {
    hot: true,
    contentBase: './public'
  });

  server.listen(8080);
});

gulp.task('js', 'Build javascripts bundle into ./public/js/app.js', (cb) => {
  const UglifyPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
  const prodConfig = merge.smart({
      plugins: [
        new UglifyPlugin({minimize: true}),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production')
        })
      ]
  }, config);
  webpack(prodConfig, (e, stats) => {
    if (e) {
      throw new gutil.PluginError('[webpack]', e);
    } else {
      util.log('[webpack]', stats.toString({
        version: true,
        timings: true,
        assets: true,
        chunks: true,
        chunkModules: true,
        modules: true
      }));
      fs.writeFile('./webpack.json', JSON.stringify(stats.toJson('verbose')));
    }
    cb();
  });
});

gulp.task('watch:css', false, () => {
  return gulp.watch([
    './assets/scss/**/*.scss'
  ], ['dev:css']);
});

gulp.task('watch:html', false, () => {
  return gulp.watch([
    './assets/blob/**/*.*'
  ], ['dev:html']);
});

gulp.task('watch', 'Monitor and rebuild images and css files.', ['watch:html', 'watch:css']);
gulp.task('dev', 'Development mode. Starts',['dev:html', 'dev:css', 'server', 'watch']);
gulp.task('build', 'Build the site.', ['build:css', 'build:html', 'js']);
