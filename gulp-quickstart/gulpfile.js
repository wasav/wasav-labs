var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();

var config = {
    css: 'css/*.css',
    js: 'js/*.js',
    release: {
        path: 'dist',
        js: 'dist/js',
        css: 'dist/css'
    },
    mainHTML: 'index.html'
};

/*
 * DEBUG TASK :
 *  - lint js and css
 *  - inject js and css into the index.html
 *  - start livereloading server
 *  - watch file changes
 */
gulp.task('lint-css', lintcss);
gulp.task('lint-js', lintjs);
gulp.task('lint', ['lint-css', 'lint-js']);
gulp.task('prepare-debug', ['lint'], injectDebug);
gulp.task('server', ['prepare-debug'], server);
gulp.task('debug', ['prepare-debug', 'server'], function () {
   gulp.watch([config.css, config.js, config.mainHTML], ['prepare-debug']);
});

function injectDebug() {
   return gulp.src(config.mainHTML)
    .pipe(plugins.inject(
                gulp.src(
                    [config.css, config.js], 
                    {read: false}
                ), 
                {relative: false, addRootSlash: false}
            )
         )
    .pipe(gulp.dest('.'));
}

function server() {
    return gulp.src('.')
            .pipe(plugins.serverLivereload({
                livereload: true,
                  directoryListing: false,
                  open: true
            }));
}

function lintcss() {
    return gulp.src(config.css)
            .pipe(plugins.csslint())
            .pipe(plugins.csslint.reporter());
}

function lintjs() {
    return gulp.src(config.js)
            .pipe(plugins.jslint({
                global: ['window', 'console']
            }));
}

/*
 * RELEASE TASK :
 *  - lint js and css
 *  - concat js and css
 *  - minify js and css
 *  - send files to dist directory
 *  - inject js and css into the index.html
 */
gulp.task('release-js', ['lint-js'], releaseJS);
gulp.task('release-css', ['lint-css'], releaseCSS);
gulp.task('prepare-release', ['lint', 'release-js', 'release-css'], injectHTMLRelease);
gulp.task('release', ['lint', 'release-js', 'release-css', 'prepare-release']);

function releaseJS() {
    return gulp.src(config.js)
        .pipe(plugins.uglify())
        .pipe(plugins.concat('scripts.js'))
        .pipe(gulp.dest(config.release.js));
}
              
function releaseCSS() {
    return gulp.src(config.css)
        .pipe(plugins.uglifycss())
        .pipe(plugins.concat('style.css'))
        .pipe(gulp.dest(config.release.css));
}

function copyHtml() {
    return gulp.src(config.mainHTML)
            .pipe(gulp.dest(config.release.path));
}

function injectHTMLRelease() {
    var sources = gulp.src(['js/scripts.js', 'css/style.css'], {read: false, cwd: config.release.path});
    return gulp.src(config.mainHTML)
            .pipe(plugins.inject(sources, {relative: false, addRootSlash: false}))
            .pipe(gulp.dest(config.release.path));
}