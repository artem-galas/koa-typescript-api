const gulp = require('gulp');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const nodemon = require('gulp-nodemon');
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
    .pipe(tsProject())
    .js
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
  gulp.watch(appPath, ['scripts']);
});

gulp.task('assets', () => {
  return gulp.src(assets)
    .pipe(gulp.dest('dist/assets'));
});

gulp.task('nodemon', () => {
  return nodemon({
    script: 'dist/index.js',
    watch: ['dist/*.js']
  });
});

gulp.task('default', ['watch', 'assets', 'nodemon']);