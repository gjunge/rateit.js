/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');



gulp.task('default', function () {
    return gulp.src('scripts/jquery.rateit.js')
       .pipe(sourcemaps.init())
       .pipe(plumber())
       .pipe(uglify({ output: { comments: '/\/\*!/'} }))
       .pipe(rename({ extname: '.min.js' }))
       .pipe(sourcemaps.write(''))
       .pipe(gulp.dest('scripts')) // save .min.js
});
