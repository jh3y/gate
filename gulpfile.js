var gulp       = require('gulp'),
  gConfig      = require('./gulp-config'),
  browserSync  = require('browser-sync'),
  pluginOpts   = gConfig.pluginOpts,
  plugins      = require('gulp-load-plugins')(pluginOpts.load),
  isDist       = (plugins.gUtil.env.dist)    ? true: false,
  isDev        = (plugins.gUtil.env.dev)     ? true: false,
  isDeploy     = (plugins.gUtil.env.deploy)  ? true: false,
  isMapped     = (plugins.gUtil.env.map)     ? true: false,
  isStat       = (plugins.gUtil.env.stat)    ? true: false,
  isTest       = (plugins.gUtil.env.test)    ? true: false,
  sources      = gConfig.paths.sources,
  destinations = gConfig.paths.destinations;

/*
  serve; creates local static livereload server using browser-sync.
*/
gulp.task('serve', ['build:complete'], function(event) {
  browserSync(pluginOpts.browserSync);
  return gulp.watch(sources.overwatch).on('change', browserSync.reload);
});



/*
  js:compile/js:watch
*/

gulp.task('js:compile', ['tmpl:compile'], function(event) {
  return gulp.src([sources.js, destinations.templates + '**/*.*'])
    .pipe(plugins.plumber())
    .pipe(isMapped ? gulp.dest(destinations.js): plugins.gUtil.noop())
    .pipe(isMapped ? plugins.sourcemaps.init(): plugins.gUtil.noop())
    .pipe(plugins.order([
      '**/*.js',
      '**/templates.js'
    ]))
    .pipe(plugins.concat(gConfig.pkg.name + '.js'))
    .pipe(plugins.wrap(pluginOpts.wrap))
    .pipe(gulp.dest(destinations.js))
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(plugins.ngmin())
    .pipe(plugins.uglify(pluginOpts.uglify))
    .pipe(gulp.dest(destinations.js));
});

gulp.task('js:watch', function(event) {
  gulp.watch(sources.js, ['js:compile']);
});


gulp.task('tmpl:compile', function() {
  return gulp.src(sources.templates)
    .pipe(plugins.jade())
    .pipe(plugins.templateCache({
        module: 'gate'
    }))
    .pipe(gulp.dest(destinations.templates));
});

gulp.task('tmpl:watch', function() {
    gulp.watch(sources.templates, ['js:compile']);
});


/*
  stylus:compile/stylus:watch

  watch for changes to stylus files then compile stylesheet from source
  auto prefixing content and generating output based on env flag.
*/
gulp.task('stylus:compile', function(event) {
  return gulp.src(sources.stylus)
    .pipe(plugins.plumber())
    .pipe(plugins.concat(gConfig.pkg.name + '.stylus'))
    .pipe(plugins.stylus())
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(isDeploy ? plugins.gUtil.noop(): gulp.dest(isDist ? destination.dist: destinations.css))
    .pipe(plugins.prefix(gConfig.prefix))
    .pipe(plugins.minify())
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(gulp.dest(isDist ? destination.dist: destinations.css));
});
gulp.task('stylus:watch', function(event) {
  gulp.watch(sources.stylus, ['stylus:compile']);
});


/*
  jade:compile/jade:watch

  watch for all jade file changes then compile
  page document files.
*/
gulp.task('jade:compile', function(event) {
  return gulp.src(sources.docs)
    .pipe(plugins.plumber())
    .pipe(isDeploy ? plugins.jade(): plugins.jade(pluginOpts.jade))
    .pipe(gulp.dest(destinations.html));
});
gulp.task('jade:watch', function(event){
  gulp.watch(sources.jade, ['jade:compile']);
});

gulp.task('deploy:ghpages', ['build:complete'], function(event) {
  isDeploy = true;
  return gulp.src(sources.overwatch)
    .pipe(plugins.deploy());
});


gulp.task('vendor:publish:js', function(e) {
  var testFilter = plugins.filter([
    '**/*.*',
    '!angular-mocks/*.js',
    '!sinon/*.js'
  ]);
  return gulp.src(sources.vendor.js, {base: 'src/vendor'})
    .pipe(isTest ? plugins.gUtil.noop(): testFilter)
    .pipe(plugins.concat('vendor.js'))
    .pipe(gulp.dest(destinations.js))
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(plugins.uglify(pluginOpts.uglify))
    .pipe(gulp.dest((isTest) ? destinations.test: destinations.js));
});

gulp.task('publish:json', function(e) {
  return gulp.src(sources.json)
    .pipe(gulp.dest(destinations.json));
});

gulp.task('vendor:publish:css', function(e) {
  return gulp.src(sources.vendor.css)
    .pipe(plugins.concat('vendor.css'))
    .pipe(gulp.dest(destinations.css))
    .pipe(plugins.minify(pluginOpts.minify))
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(gulp.dest(destinations.css));
});

gulp.task('vendor:publish', [
  'vendor:publish:css',
  'vendor:publish:js',
  'publish:json'
]);

gulp.task('build:complete', [
  'jade:compile',
  'stylus:compile',
  'js:compile',
  'vendor:publish'
]);

gulp.task('watch', [
  'jade:watch',
  'stylus:watch',
  'js:watch',
  'tmpl:watch'
]);


var defaultTasks = isDeploy ? [
  'deploy:ghpages'
]:[
  'serve',
  'watch'
];

gulp.task('default', defaultTasks);
