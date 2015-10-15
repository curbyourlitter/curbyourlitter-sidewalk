'use strict';

var gulp = require('gulp');
var del = require('del');
var path = require('path');
var historyApiFallback = require('connect-history-api-fallback');

// Load plugins
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var envify = require('envify/custom');
var watchify = require('watchify');
var babelify = require('babelify');
var source = require('vinyl-source-stream'),
    sourceFile = './app/scripts/app.jsx',
    destFolder = './dist/scripts',
    destFileName = 'app.js';

var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Styles
gulp.task('styles', ['less']);

gulp.task('less', function() {
    return gulp.src(['app/styles/**/*.less', 'app/styles/**/*.css'])
        .pipe($.less({
            precision: 10,
            paths: [path.join(__dirname, 'app', 'styles')]
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());
});


var bundler = watchify(
    browserify({
    entries: [sourceFile],
    debug: true,
    insertGlobals: true,
    cache: {},
    packageCache: {},
    fullPaths: true
}))
    .transform(babelify)
    .transform(envify({ NODE_ENV: 'development' }));

bundler.on('update', rebundle);
bundler.on('log', $.util.log);

function rebundle() {
    return bundler.bundle()
        // log errors if they happen
        .on('error', $.util.log.bind($.util, 'Browserify Error'))
        .pipe(source(destFileName))
        .pipe(gulp.dest(destFolder))
        .on('end', function() {
            reload();
        });
}

// Scripts
gulp.task('scripts', rebundle);

gulp.task('buildScripts', function() {
    return browserify({
        entries: [sourceFile],
        insertGlobals: true,
        fullPaths: false
    })
        .transform(babelify)
        .transform(envify({ NODE_ENV: 'production' }))
        .bundle()
        .pipe(source(destFileName))
        .pipe(gulp.dest('dist/scripts'));
});

// HTML
gulp.task('html', function() {
    return gulp.src('app/*.html')
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

// Build/deploy scripts
gulp.task('deploymentScripts', function() {
    return gulp.src('build/*')
        .pipe($.useref())
        .pipe(gulp.dest('dist/build'))
        .pipe($.size());
});

// Images
gulp.task('images', function() {
    return gulp.src('app/images/**/*')
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
});

// Clean
gulp.task('clean', function(cb) {
    $.cache.clearAll();
    cb(del.sync(['dist/styles', 'dist/scripts', 'dist/images']));
});

// Bundle
gulp.task('bundle', ['styles', 'scripts', 'bower'], function() {
    return gulp.src('./app/*.html')
        .pipe($.useref.assets())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('buildBundle', ['styles', 'buildScripts', 'bower'], function() {
    return gulp.src('./app/*.html')
        .pipe($.useref.assets())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

// Bower helper
gulp.task('bower', function() {
    gulp.src('app/bower_components/**/*', {
        base: 'app/bower_components'
    })
        .pipe(gulp.dest('dist/bower_components/'));
});

// Robots.txt and favicon.ico
gulp.task('extras', function() {
    return gulp.src(['app/*.txt', 'app/*.ico'])
        .pipe(gulp.dest('dist/'))
        .pipe($.size());
});

// Watch
gulp.task('watch', ['html', 'images', 'fonts', 'bundle', 'extras'], function() {
    browserSync({
        browser: 'chromium-browser',
        notify: false,
        logPrefix: 'BS',
        middleware: [historyApiFallback()],
        server: ['dist', 'app']
    });

    gulp.watch('app/*.html', ['html']);
    gulp.watch(['app/styles/**/*.less', 'app/styles/**/*.css'], ['styles', reload]);
    gulp.watch('app/images/**/*', reload);
});

// Build
gulp.task('build', ['html', 'buildBundle', 'deploymentScripts', 'images', 'fonts', 'extras'], function() {
    gulp.src('dist/scripts/app.js')
        .pipe($.uglify())
        .pipe($.stripDebug())
        .pipe(gulp.dest('dist/scripts'));
});

// Default task
gulp.task('default', ['clean', 'build']);
