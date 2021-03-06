module.exports = function (grunt) {

  var urlPath,
      requirejsConf,
      runFiles,
      sassConf,
      watchFiles;

  urlPath = {
    ade_search: '/acadis/search',
    nsidc_search: '/data/search'
  };

  requirejsConf = {
    appDir: 'src/',
    baseUrl: 'scripts/',
    dir: 'build/',
    findNestedDependencies: true,
    generateSourceMaps: true,
    inlineText: true,
    name: 'main',
    optimize: 'uglify2',
    optimizeCss: 'none',
    paths: {
      conf: '../conf/',
      appConfig: '../conf/appConfig',
      iocConfig: '../conf/iocConfig',
      templates: '../templates/underscore',
      vendor: '../vendor'
    },
    preserveLicenseComments: false,
    shim: {
      'vendor/debug': {
        exports: 'debug'
      }
    }
  };

  // files that tasks run on
  runFiles = {
    jshint: ['Gruntfile.js', 'src/scripts/**/*.js', 'spec/**/*.js', 'src/conf/**/*.js'],
    scsslint: ['src/sass/**/*.scss'],
    specs: ['spec/**/*.js']
  };

  sassConf = {
    bundleExec: true,
    compass: true,
    precision: 2,
    sourcemap: true,
    style: '<%= environment === "development" ? "expanded" : "compressed" %>',
    lineNumbers: '<%= environment === "development" %>'
  };

  // files that should trigger their tasks when changed while `grunt watch` is
  // happening; mostly this includes runFiles and relevant config files
  watchFiles = {
    jshint: runFiles.jshint.concat(['.jshintrc']),
    scsslint: runFiles.scsslint.concat(['config/scss-lint*.yml']),
    specs: runFiles.specs.concat(['src/scripts/**/*.js', 'src/conf/**/*.js', 'src/templates/underscore/**/*.html'])
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    environment: grunt.option('environment') || 'development',
    project: grunt.option('project'),
    urlPath: urlPath[grunt.option('project')],
    url: grunt.option('url') || 'http://<%= environment %>.nsidc.org/<%= urlPath %>',

    availabletasks: {
      tasks: {
        options: {
          filter: 'include',
          tasks: [
            'build:acadis-dev',
            'build:ade_search',
            'build:nsidc-dev',
            'build:nsidc_search',
            'default',
            'deploy',
            'githooks',
            'jshint',
            'release',
            'scsslint',
            'serve-tests',
            'tasks',
            'test:acceptance',
            'test:unit',
            'updateTag'
          ],
          groups: {
            'Build for Development': ['build:acadis-dev', 'build:nsidc-dev'],
            'Deployment/Release': ['build:ade_search', 'build:nsidc_search', 'deploy', 'release', 'updateTag'],
            'Miscellaneous': ['default', 'githooks', 'tasks'],
            'Syntax': ['scsslint', 'jshint'],
            'Tests': ['test:acceptance', 'test:unit', 'serve-tests']
          },
          descriptions: {
            'build:acadis-dev': 'Compile Jade to HTML and Sass to CSS into src/ for ADE.',
            'build:nsidc-dev': 'Compile Jade to HTML and Sass to CSS into src/ for NSIDC Search.',
            'build:ade_search': 'Compile Jade and Sass, minify JavaScript into build/ for ADE. [--environment]',
            'build:nsidc_search': 'Compile Jade and Sass, minify JavaScript into build/ for NSIDC Search. [--environment]',
            'default': 'Run syntax checkers and unit tests.',
            'deploy': 'Copy build/ to /opt/$project on a VM [--environment --project]',
            'release': 'Bump version, update CHANGELOG.md, git tag, git push.',
            'serve-tests': 'Run unit tests (for debugging) in a browser with a connect web server.',
            'tasks': 'List available Grunt tasks & targets.',
            'test:acceptance': 'Run Cucumber features. [--environment --project]',
            'test:unit': 'Run jasmine specs headlessly through PhantomJS.',
            'updateTag': 'Update the git tag to indicate which commit is deployed. [--environment --project]'
          }
        }
      }
    },

    clean: {
      dev: ['src/index*.html', 'src/css/'],

      build: ['build/'],

      // requirejs optimizer copies in conf/, templates/, scripts/collections,
      // scripts/lib, scripts/models, and scripts/views, but that is all
      // contained in main.js anyway
      'post-build': ['build/conf/', 'build/templates/', 'build/scripts/*', 'build/build.txt', '!build/scripts/main.*']
    },

    connect: {
      spec: {
        options: {
          port: 8081
        }
      },
      site: {
        options: {
          base: 'src',
          hostname: '',
          keepalive: true,
          middleware: function (connect, options) {
            var virtualSsi = require('connect-ssi');
            return [
              require('grunt-connect-proxy/lib/utils').proxyRequest,
              virtualSsi('http://qa.nsidc.org'),
              connect.static(options.base)
            ];
          },
          port: 8080
        },
        proxies: [
          {
            context: '/api/dataset/2/',
            host: 'liquid.colorado.edu',
            port: '10680'
          }
        ]
      }
    },

    /* jshint ignore:start */
    copy: {
      bower: {
        files: [
          {flatten: true, expand: true, src: ['bower_components/backbone/backbone.js'], dest: 'src/contrib/backbone/'},
          {flatten: true, expand: true, src: ['bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js', 'bower_components/bootstrap-datepicker/css/datepicker.css'], dest: 'src/contrib/bootstrap-datepicker/'},
          {flatten: true, expand: true, src: ['bower_components/ie-warn/build/ie-warn-latest.min.js'], dest: 'src/contrib/ie-warn/'},
          {flatten: true, expand: true, src: ['bower_components/jquery-ui-message/src/js/jquery.ui.message.js'], dest: 'src/contrib/jquery-ui-message/'},
          {flatten: true, expand: true, src: ['bower_components/jquery/dist/jquery.min.js', 'bower_components/jquery/dist/jquery.min.map'], dest: 'src/contrib/jquery/'},
          {flatten: true, expand: true, src: ['bower_components/leaflet-dvf/dist/leaflet-dvf.min.js'], dest: 'src/contrib/leaflet-dvf/'},
          {flatten: true, expand: true, src: ['bower_components/moment/min/moment.min.js'], dest: 'src/contrib/momentjs/'},
          {flatten: true, expand: true, src: ['bower_components/opensearchlight/index.js'], dest: 'src/contrib/opensearchlight/'},
          {flatten: true, expand: true, src: ['bower_components/openlayers/build/OpenLayers.js'], dest: 'src/contrib/openlayers/'},
          {flatten: true, expand: true, src: ['bower_components/requirejs/require.js'], dest: 'src/contrib/requirejs/'},
          {flatten: true, expand: true, src: ['bower_components/underscore/underscore.js'], dest: 'src/contrib/underscore/'},
          {flatten: true, expand: true, src: ['bower_components/underscore.string/dist/underscore.string.min.js'], dest: 'src/contrib/underscore/'},
          {flatten: true, expand: true, src: ['bower_components/typeahead.js/dist/typeahead.bundle.min.js'], dest: 'src/contrib/typeaheadjs/'},
          {flatten: true, expand: true, src: ['bower_components/x2js/xml2json.min.js'], dest: 'src/contrib/x2js/'},
          {flatten: true, expand: true, src: ['bower_components/xregexp/min/xregexp-all-min.js'], dest: 'src/contrib/xregexp/'},
          {expand: true, cwd: 'bower_components/bootstrap', src: ['docs/assets/js/bootstrap.js', 'docs/assets/js/bootstrap.min.js', 'docs/assets/css/bootstrap.css', 'docs/assets/img/glyphicons-halflings.png', 'docs/assets/img/glyphicons-halflings-white.png'], dest: 'src/contrib/bootstrap/'},
          {expand: true, cwd: 'bower_components/fontawesome', src: ['**'], dest: 'src/contrib/fontawesome/'},
          {expand: true, cwd: 'bower_components/leaflet', src: ['**'], dest: 'src/contrib/leaflet/'},
          {expand: true, cwd: 'bower_components/openlayers', src: ['img/**/*', 'theme/**/*'], dest: 'src/contrib/openlayers/'},
          {expand: true, cwd: 'bower_components/proj4', src: ['**'], dest: 'src/contrib/proj4/'},
          {expand: true, cwd: 'bower_components/tipsy', src: ['**'], dest: 'src/contrib/tipsy/'},
          {expand: true, cwd: 'bower_components/web-socket-js', src: ['**'], dest: 'src/contrib/web-socket-js/'}
        ]
      }
    },
    /* jshint ignore:end */

    // after hooks are installed, they can still be ignored by passing the
    // option --no-verify
    githooks: {
      all: {
        'pre-commit': 'scsslint jshint',
        'pre-push': 'jasmine'
      }
    },

    // These are used to add latest tag when version bumping.
    gittag: {
      addLatest: {
        options: {
          tag: 'latest',
          message: 'Adding latest tag.'
        }
      },
      deleteLatest: {
        options: {
          tag: 'latest',
          remove: true
        }
      }
    },

    gitpush: {
      pushLatest: {
          options: {
            tags: true,
            force: true
          }
      }
    },

    gitfetch: {
      fetchTags: {
        all: true
      }
    },

    // 'jade:acadis' and 'jade:nsidc' used when the portal is built for
    // deployment; use '-dev' for local development
    jade: {
      options: {
        basedir: 'src',
        pretty: true
      },
      'acadis-dev': {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'ACADIS',
            title: 'Arctic Data Explorer',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'src/index-acadis.html': ['src/templates/acadis-index.jade'],
          'src/index.html': ['src/templates/acadis-index.jade']
        }
      },
      'nsidc-dev': {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'NSIDC',
            title: 'NSIDC Scientific Data Search',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'src/index-nsidc.html': ['src/templates/nsidc-index.jade'],
          'src/index.html': ['src/templates/nsidc-index.jade']
        }
      },
      acadis: {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'ACADIS',
            title: 'Arctic Data Explorer',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'build/index.html': ['src/templates/acadis-index.jade']
        }
      },
      nsidc: {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'NSIDC',
            title: 'NSIDC Scientific Data Search',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'build/index.html': ['src/templates/nsidc-index.jade']
        }
      }
    },

    jasmine: {
      all: {
        src: [],
        options: {
          helpers: ['spec/specHelper.js'],
          keepRunner: true,
          specs: runFiles.specs,
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfig: {
              baseUrl: 'src/scripts/',
              paths: {
                conf: '../conf/nsidc',
                templates: '../templates/underscore',
                vendor: '../vendor'
              },
              shim: {
                'vendor/debug': {
                  exports: 'debug'
                }
              }
            }
          },
          vendor: [
            'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/underscore.string/2.3.0/underscore.string.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.0/jquery.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min.js',
            'src/contrib/bootstrap/js/bootstrap.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.0/js/bootstrap-datepicker.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/openlayers/2.12/OpenLayers.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/openlayers/2.12/OpenLayers.debug.js',
            'src/contrib/opensearchlight/OpenSearchlight.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/xregexp/2.0.0/xregexp-all-min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/sinon.js/1.7.3/sinon-min.js',
            'src/contrib/tipsy/javascripts/jquery.tipsy.js',
            'src/contrib/jasmine-jquery/jasmine-jquery-1.4.2.js',
            'src/contrib/jasmine-sinon/jasmine-sinon.js',
            'http://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.2/typeahead.bundle.min.js',
            'src/scripts/lib/require_mocking.js'
          ]
        }
      }
    },

    jshint: {
      all: runFiles.jshint,
      options: {
        jshintrc: '.jshintrc'
      }
    },

    release: {
      options: {
        changelog: true,
        changelogText: '## <%= version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n\n',
        npm: false,
        npmtag: false,
        tagName: 'v<%= version %>'
      }
    },

    requirejs: {
      acadis: {
        options: requirejsConf
      },
      nsidc: {
        options: requirejsConf
      }
    },

    // 'sass:acadis' and 'sass:nsidc' used when the portal is built for
    // deployment; use 'sass:dev' for local development
    //
    // sass/ must have the same parent directory as css/ for sourcemaps to work;
    // when building for deployment, the requirejs optimizer first copies
    // src/sass/ to build/sass
    sass: {
      'dev': {
        files: {
          'src/css/acadis-search.css': 'src/sass/acadis_main.scss',
          'src/css/nsidc-search.css': 'src/sass/nsidc_main.scss'
        },
        options: sassConf
      },
      acadis: {
        files: {
          'build/css/acadis-search.css': 'build/sass/acadis_main.scss'
        },
        options: sassConf
      },
      nsidc: {
        files: {
          'build/css/nsidc-search.css': 'build/sass/nsidc_main.scss'
        },
        options: sassConf
      }
    },

    scsslint: {
      all: runFiles.scsslint,
      options: {
        bundleExec: true,
        config: 'config/scss-lint.yml'
      }
    },

    shell: {
      // --environment - one of 'integration', 'qa', 'staging'
      //
      // --project - 'ade_search' or 'nsidc_search'
      cucumber: {
        command: [
          'URL=<%= url %>',
          'bundle exec cucumber spec/cucumber/features',
          '--tags @<%= project %>',
          '--format pretty',
          '-r spec/cucumber/features/support',
          '-r spec/cucumber/features/step_definitions',
          '-r spec/cucumber/features/page_objects',
        ].join(' ')
      },

      // --project=PROJECT - project name, must be 'ade_search' or
      //     'nsidc_search'; build/ is deployed to /opt/$PROJECT
      //
      // --environment=ENV - environment being deployed, needed for the 'vagrant
      //     nsidc ssh' command
      deploy: {
        command: [
          'vagrant nsidc ssh --project=<%= project %> --env=<%= environment %>',
          '-c "sudo rm -rf /opt/<%= project %>; sudo cp -r /vagrant/build/ /opt/<%= project %>"'
        ].join(' ')
      },

      updateTag: {
        command: [
          'git tag --force <%= project %>-<%= environment %>',
          'git push --force origin refs/tags/<%= project %>-<%= environment %>'
        ].join(' && ')
      }
    },

    watch: {
      'build-acadis': {
        files: ['src/sass/**/*', 'src/templates/*.jade', 'Gruntfile.js'],
        tasks: ['build:acadis-dev']
      },
      'build-nsidc': {
        files: ['src/sass/**/*', 'src/templates/*.jade', 'Gruntfile.js'],
        tasks: ['build:nsidc-dev']
      },
      'sass': {
        files: ['src/sass/**/*'],
        tasks: ['sass:dev']
      },
      'lint-test': {
        files: Array.prototype.concat(
          watchFiles.jshint,
          watchFiles.scsslint,
          watchFiles.specs
        ),
        tasks: ['lint-test']
      },
      jshint: {
        files: watchFiles.jshint,
        tasks: ['jshint']
      },
      scsslint: {
        files: watchFiles.scsslint,
        tasks: ['scsslint']
      },
      specs: {
        files: watchFiles.specs,
        tasks: ['jasmine']
      }
    }

  });

  grunt.loadNpmTasks('grunt-available-tasks');
  grunt.loadNpmTasks('grunt-connect-proxy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-scss-lint');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-git');

  // build tasks for local development; note that both projects are built
  //
  // both build tasks allow NSIDC Search to be mounted at /data/search/ and
  // ADE to be mounted at /acadis/search/ on your localhost
  //
  // build:nsidc-dev allows NSIDC Search to be mounted at /
  // build:acadis-dev allows ADE to be mounted at /
  grunt.registerTask('build:acadis-dev', ['clean:dev', 'jade:nsidc-dev', 'jade:acadis-dev', 'sass:dev']);
  grunt.registerTask('build:nsidc-dev', ['clean:dev', 'jade:acadis-dev', 'jade:nsidc-dev', 'sass:dev']);

  // build tasks for deployment
  grunt.registerTask('build:acadis', ['clean:build', 'requirejs:acadis', 'jade:acadis', 'sass:acadis', 'clean:post-build']);
  grunt.registerTask('build:nsidc', ['clean:build', 'requirejs:nsidc', 'jade:nsidc', 'sass:nsidc', 'clean:post-build']);
  grunt.registerTask('build:ade_search', 'build:acadis');
  grunt.registerTask('build:nsidc_search', 'build:nsidc');

  grunt.registerTask('lint-test', ['scsslint', 'jshint', 'jasmine']);
  grunt.registerTask('serve-tests', 'connect:spec:keepalive');
  grunt.registerTask('server', 'connect:site');

  grunt.registerTask('test:acceptance', 'shell:cucumber');
  grunt.registerTask('test:unit', 'jasmine');

  grunt.registerTask('tasks', 'availabletasks:tasks');
  grunt.registerTask('deploy', 'shell:deploy');
  grunt.registerTask('updateTag', 'shell:updateTag');
  grunt.registerTask('tagLatest', ['gitfetch:fetchTags', 'gittag:deleteLatest', 'gitpush:pushLatest', 'gittag:addLatest', 'gitpush:pushLatest']);
  grunt.registerTask('default', ['lint-test']);

};
