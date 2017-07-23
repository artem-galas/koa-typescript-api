const gulp = require('gulp');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');

const del = require('del');
const assets = ['app/assets/*'];
const appPath = 'app/**/*.ts';

const tsProject = ts.createProject('./tsconfig.json');

gulp.task('lint', () => {
  return gulp.src(appPath)
    .pipe(tslint({
      formatter: 'verbose'
    }))
    .pipe(tslint.report({
      reportLimit: 5
    }))
});

gulp.task('scripts', ['lint'], () => {
  return tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .js
    .pipe(sourcemaps.write(('maps')))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
  gulp.watch(appPath, ['scripts']);
});

gulp.task('set-test-node-env', function() {
  return process.env.NODE_ENV = 'test';
});

gulp.task('test-controllers', ['set-test-node-env', 'scripts'], () => {
  return gulp.src('./dist/test/controllers', {read: false})
    .pipe(mocha({
      reporter: 'spec'
    }))
    .once('error', () => {
      process.exit(1);
    })
    .once('end', () => {
      process.exit();
    })
});

gulp.task('nodemon', () => {
  return nodemon({
    script: 'dist/index.js',
    watch: ['dist/*.js']
  });
});

gulp.task('clean', function(){
  return del(['dist/**', '!dist'], {force:true});
});

gulp.task('default', ['clean', 'watch', 'nodemon']);
gulp.task('test', ['clean', 'test-controllers']);
