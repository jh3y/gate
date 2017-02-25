var env = 'public/';
  pkg   = require('./package.json');
module.exports = {
  pkg: {
    name: pkg.name
  },
  pluginOpts: {
    coffee: {
      bare: true
    },
    jade: {
      pretty: true
    },
    rename: {
      suffix: '.min'
    },
    minify: {
      keepSpecialComments: 1
    },
    uglify: {
      preserveComments: 'license'
    },
    gSize: {
      showFiles: true
    },
    browserSync: {
      port   : 1987,
      server : {
        baseDir: env
      }
    },
    prefix: [
      'last 3 versions',
      'Blackberry 10',
      'Android 3',
      'Android 4'
    ],
    wrap: '(function() { <%= contents %> }());',
    load: {
      rename: {
        'gulp-gh-pages'             : 'deploy',
        'gulp-util'                 : 'gUtil',
        'gulp-minify-css'           : 'minify',
        'gulp-autoprefixer'         : 'prefix',
        'gulp-ng-annotate'          : 'ngmin',
        'gulp-angular-templatecache': 'templateCache'
      }
    }
  },
  paths: {
    base: env,
    sources: {
      js       : 'src/js/**/*.js',
      json     : 'src/json/**/*.json',
      coffee   : 'src/coffee/**/*.coffee',
      docs     : 'src/jade/*.jade',
      jade     : 'src/jade/**/*.jade',
      stylus   : 'src/stylus/**/*.stylus',
      overwatch: env + '**/*.*',
      templates: 'src/templates/**/*.jade',
      vendor   : {
        js: [
          'src/vendor/jquery/dist/jquery.js',
          'src/vendor/angular/angular.js',
          'src/vendor/angular-resource/angular-resource.js',
          'src/vendor/angular-route/angular-route.js',
          'src/vendor/angular-mocks/angular-mocks.js',
          'src/vendor/sinon/index.js'
        ],
        css: [
          'src/vendor/normalize.css/normalize.css'
        ]
      }
    },
    destinations: {
      dist     : './dist',
      js       : env + 'js/',
      html     : env,
      json     : env,
      css      : env + 'css/',
      test     : 'test/',
      templates: 'tmp/'
    }
  }
};
