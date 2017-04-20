/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-tsc');
gulp.task('compile', function(){
  gulp.src(['src/*.ts'])
    .pipe(typescript({ target: 'es5'}))
    .pipe(gulp.dest('scripts/'))
});

gulp.task('minify', function () {
    return gulp.src(['scripts/rateit.js','scripts/jquery.rateit.js'])
       .pipe(sourcemaps.init())
       .pipe(plumber())
       .pipe(uglify({ preserveComments: 'license' }))
       .pipe(rename({ extname: '.min.js' }))
       .pipe(sourcemaps.write(''))
       .pipe(gulp.dest('scripts')) // save .min.js
});

gulp.task('default', ['compile', 'minify']);