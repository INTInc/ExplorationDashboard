/*
 * Copyright: Copyright (c) 2013 by INT, Inc.  All rights reserved.<br>
 * Company: INT, Inc. <br>
 * INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

module.exports = function (grunt) {

    var PROJECT_SRC_FILES = grunt.file.readJSON('src/project.json');
    var PROJECT_DEST_PATH = 'bin/project.js';


    var ADV_PROJECT_SRC_FILES = grunt.file.readJSON('src/debug_toolkit_libs.json').concat(PROJECT_SRC_FILES);
    var ADV_PROJECT_DEST_PATH = 'bin/project.obf.js';

    grunt.initConfig({
        pkg: grunt.file.readJSON('../../package.json'), //<- load npm modules
        concat: {
            project: {
                src: PROJECT_SRC_FILES,
                dest: PROJECT_DEST_PATH
            },
            obfuscate_project: {
                src: ADV_PROJECT_SRC_FILES,
                dest: PROJECT_DEST_PATH
            }
        },
        less: {
            debug: {
                options: {
                    paths: [
                        'css'
                    ]
                },
                files: {
                    'css/project.css': 'less/view.less'
                }
            }
        },
        imagemin: {
            dynamic: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: '../..',
                        src: [
                            'images/**/*.{png,PNG,jpg,gif}',
                            'WEP/common/images/**/*.{png,PNG,jpg,gif}',
                            'WEP/Exploration/images/**/*.{png,PNG,jpg,gif}'
                        ],
                        dest: 'dist/epexploration/images/'
                    }
                ]
            }
        },
        copy: {
            'html': {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['index.obf.html', '../../favicon.ico'],
                        cwd: '',
                        dest: 'dist/epexploration/',
                        filter: 'isFile'
                    }
                ]
            },
            'geotoolkit_adv': {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '../../lib/geotoolkit/**.adv.js',
                            '../../lib/geotoolkit/**.min.js',
                            '../../lib/three/**.min.js',
                            '../../lib/three/**.patch.js'
                        ],
                        cwd: '.',
                        dest: 'dist/epexploration/js/',
                        filter: 'isFile'
                    }
                ]
            },
            'dist_img': {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: '../..',
                        src: ['images/logo-int-white.svg'],
                        dest: 'dist/epexploration/images/',
                        filter: 'isFile'
                    }
                ]
            },
            "dist_lib_js": {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '../../bower_components/jquery/dist/jquery.min.js',
                            '../../bower_components/underscore/underscore-min.js',
                            '../../bower_components/bootstrap/dist/js/bootstrap.min.js'
                        ],
                        cwd: '.',
                        dest: 'dist/epexploration/js/',
                        filter: 'isFile'
                    }
                ]
            },
            'dist_css': {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '../../bower_components/bootstrap/dist/css/bootstrap.min.css',
                            '../../bower_components/bootstrap/dist/css/bootstrap-theme.min.css'
                        ],
                        cwd: '.',
                        dest: 'dist/epexploration/css/',
                        filter: 'isFile'
                    }
                ]
            },
            'dist_data': {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        src: ['data/**/*'],
                        cwd: '.',
                        dest: 'dist/epexploration/',
                        filter: 'isFile'
                    }
                ]
            },
            'dist_font': {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: '../..',
                        src: [
                            'bower_components/bootstrap/fonts/**/*',
                            'bower_components/font-awesome/fonts/**/*'
                        ],
                        dest: 'dist/epexploration/fonts/',
                        filter: 'isFile'
                    }
                ]
            }
        },
        'sails-linker': {
            dist_js: {
                options: {
                    appRoot: 'dist/epexploration/',
                    startTag: '<!-- main:js -->',
                    endTag: '<!-- main:js END-->',
                    fileTmpl: '<script src="%s"></script>'
                },
                files: {
                    'dist/epexploration/index.html': getPublishJSFiles()
                }
            },
            dist_css: {
                options: {
                    appRoot: 'dist/epexploration/',
                    startTag: '<!-- Css -->',
                    endTag: '<!-- Css END-->',
                    fileTmpl: '<link rel="stylesheet" href="%s">'
                },
                files: {
                    'dist/epexploration/index.html': getPublishCSSFiles()
                }
            },
            src: {
                options: {
                    startTag: '<!-- main:js -->',
                    endTag: '<!-- main:js END-->',
                    fileTmpl: '<script src="%s"></script>'
                },
                files: {
                    './index.html': [].concat(getLibFiles(false)).concat(getToolkitFiles()).concat(getProjectFiles())
                }
            },
            src_debug: {
                options: {
                    startTag: '<!-- main:js -->',
                    endTag: '<!-- main:js END-->',
                    fileTmpl: '<script src="%s"></script>'
                },
                files: {
                    './index.html': [].concat(getLibFiles(true)).concat(getToolkitFiles(true)).concat(getProjectFiles())
                }
            },
            css: {
                options: {
                    startTag: '<!-- Css -->',
                    endTag: '<!-- Css END-->',
                    fileTmpl: '<link rel="stylesheet" href="%s">'
                },
                files: {
                    './index.html': getCSSFiles()
                }
            }
        },
        clean: {
            build: ['bin/**/*', 'dist/**/*']
        },
        watch: {
            files: ['less/**/*'],
            tasks: ['less']
        },
        cssmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'css/',
                        src: ['*.css', '!*.min.css'],
                        dest: 'dist/epexploration/css/',
                        ext: '.min.css'
                    }
                ]
            }
        },
        uglify: {
            options: {
                banner: getBannerString()
            },
            dist: {
                files: {
                    'dist/epexploration/js/project.min.js': ['<%= concat.project.dest %>']
                }
            }
        },
        rename: {
            main: {
                files: [
                    {src: ['dist/epexploration/index.obf.html'], dest: 'dist/epexploration/index.html'},
                    {src: ['bin/project.obf.js'], dest: 'dist/epexploration/js/project.obf.js'},
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-sails-linker');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('publish', '', [
        'clean:build',
        'less',
        'obfuscate',
        'imagemin:dynamic',
        'copy:html',
        'copy:dist_lib_js',
        'copy:dist_data',
        'copy:dist_img',
        'rename:main',
        'copy:dist_font',
        'copy:geotoolkit_adv',
        'cssmin:dist',

        //'sails-linker:dist_js',
        'sails-linker:dist_css'
    ]);

    grunt.registerTask('default', '', [
        'clean:build',
        'less',
        'concat:project',
        'sails-linker:css',
        'sails-linker:src'
    ]);

    grunt.registerTask('debug', '', [
        'clean:build',
        'less',
        'concat:project',
        'sails-linker:css',
        'sails-linker:src_debug'
    ]);

    grunt.registerTask('obfuscate', function() {
        grunt.task.run("concat:obfuscate_project");
        obfuscate();
    });

    function obfuscate() {
        var geotoolkitCompiler = "../../lib/compiler/dist/compiler.jar";
        var externs = ['../../lib/externs/js/underscore.js', '../../lib/externs/js/jquery.js', '../../lib/geotoolkit/three.js'];
        var externUrl = "";
        for (var u in externs) {
            externUrl += " --externs " + externs[u];
        }

        var command = 'java -jar ' + geotoolkitCompiler +
            " --warning_level QUIET" +
            " --jscomp_off suspiciousCode" +
            ' --rename_blacklist ""' +
            ' --language_in ECMASCRIPT5' +
            ' --compilation_level ADVANCED' +
            ' --js ' + PROJECT_DEST_PATH +
            externUrl +
            ' --js_output_file ' + ADV_PROJECT_DEST_PATH;

        grunt.config.set("exec.obfuscate.command", command);
        grunt.log.ok(command);

        grunt.task.run("exec:obfuscate");
    }

    function getBannerString() {
        return '' +
            '/*!\n' +
            '* Copyright: Copyright (c) 2015 by INT, Inc.  All rights reserved.\n' +
            '* Company: INT, Inc.\n' +
            '* INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.\n' +
            '*/\n' +
            '/*! INT INC. - <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */\n';
    }

    function getCSSFiles() {
        return [
            'css/**/*',
            'bower_components/bootstrap/dist/css/bootstrap.min.css',
            'bower_components/bootstrap/dist/css/bootstrap-theme.min.css'
        ];
    }

    function getToolkitFiles(debug) {
        if (debug) {
            return [
                '../../lib/geotoolkit/geotoolkit.js',
                '../../lib/geotoolkit/geotoolkit.controls.js',
                '../../lib/geotoolkit/geotoolkit.data.js',
                '../../lib/geotoolkit/geotoolkit.welllog.js',
                '../../lib/geotoolkit/geotoolkit.welllog.las.js',
                '../../lib/geotoolkit/geotoolkit.widgets.js',
                '../../lib/geotoolkit/geotoolkit.welllog.widgets.js',
                '../../lib/geotoolkit/geotoolkit3d.js',
                '../../lib/geotoolkit/geotoolkit3d.well.js'
            ];
        }

        return [
            '../../lib/geotoolkit/geotoolkit.adv.js',
            '../../lib/geotoolkit/geotoolkit.controls.adv.js',
            '../../lib/geotoolkit/geotoolkit.data.adv.js',
            '../../lib/geotoolkit/geotoolkit.welllog.adv.js',
            '../../lib/geotoolkit/geotoolkit.welllog.las.adv.js',
            '../../lib/geotoolkit/geotoolkit.widgets.adv.js',
            '../../lib/geotoolkit/geotoolkit.welllog.widgets.adv.js'
        ];
    }

    function getLibFiles(debug) {
        return [
            '../../bower_components/jquery/dist/jquery.min.js',
            '../../bower_components/underscore/underscore-min.js',
            '../../bower_components/bootstrap/dist/js/bootstrap.min.js'
        ];
    }

    function getProjectFiles() {
        return [
            '../../bower_components/jquery/dist/jquery.min.js',
            '../../bower_components/bootstrap/dist/js/bootstrap.min.js',
            '../../bower_components/underscore/underscore-min.js',
            'bin/project.obf.js'
        ];
    }

    function getPublishCSSFiles() {
        return [
            'dist/epexploration/css/project.min.css',
            'dist/epexploration/css/bootstrap.min.css',
            'dist/epexploration/css/bootstrap-theme.min.css'
        ];
    }

    function getPublishJSFiles() {
        return [
            'dist/epexploration/js/jquery.min.js',
            'dist/epexploration/js/bootstrap.min.js',
            'dist/epexploration/js/underscore-min.js',
            'dist/epexploration/js/geotoolkit.adv.js',
            'dist/epexploration/js/geotoolkit.data.adv.js',
            'dist/epexploration/js/geotoolkit.controls.adv.js',
            'dist/epexploration/js/geotoolkit.widgets.adv.js',
            'dist/epexploration/js/geotoolkit.welllog.adv.js',
            'dist/epexploration/js/geotoolkit.welllog.las.adv.js',
            'dist/epexploration/js/geotoolkit.welllog.widgets.adv.js',
            'dist/epexploration/js/project.min.js'
        ];
    }
};