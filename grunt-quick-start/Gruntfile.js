
module.exports = function(grunt) {

  grunt.initConfig({
	copy:{
		'debug-bin':{
			files:{
				'bin/<%= specific_config.debug_name %>/': ['src/**/*.js', 
														   'css/**/*.css', 
														   'index.html']
			}
		},
		debug:{
			expand: true,
			cwd: 'bin/',
			src: '<%= specific_config.debug_name %>/**',
			dest: '<%= specific_config.apache_dest %>'
		},
		release:{
			expand: true,
			cwd: 'bin/',
			src: '<%= specific_config.release_name %>/**',
			dest: '<%= specific_config.apache_dest %>'
		}
	},
	uglify:{
		options:{
			mangle: false
		},
		release:{
			files:{
				'bin/<%= specific_config.release_name %>/src/release-js-<%= specific_config.pkg.version %>.min.js': 
								'<%= specific_config.js_files_in_order %>'
			}
		}
	},
	cssmin:{
		release:{
			files:{
				'bin/<%= specific_config.release_name %>/css/release-css-<%= specific_config.pkg.version %>.min.css': 
								'<%= specific_config.css_files_in_order %>'
			}
		}
	},
	jade:{
		debug:{
			options:{
				pretty: true,
				data: {
					js: '<%= specific_config.js_files_in_order %>',
					css: '<%= specific_config.css_files_in_order %>'
				}
			},
			files:{
				"bin/<%= specific_config.debug_name %>/index.html": "index.jade"
			}
		},
		release:{
			options:{
				data:{
					css:['css/release-css-<%= specific_config.pkg.version %>.min.css'],
					js:['src/release-js-<%= specific_config.pkg.version %>.min.js']
				}
			},
			files:{
				"bin/grunt-website-release/index.html": "index.jade"
			}
		}
	},
	specific_config:{
		// JS Files, in a specific order
		js_files_in_order: grunt.file
								.expand(['src/vendors/**/*.js'])
								.concat(grunt.file
											 .expand(['src/lib/**/*.js'])),
		
		// CSS files
		css_files_in_order: grunt.file
								 .expand(['css/**/*.css']),
		
		apache_dest: 'D:/Programs/Bitnami/wampstack-5.4.33-0/apache2/htdocs/',
		
		debug_name: 'grunt-website-debug',
		release_name: 'grunt-website-release',
		pkg: grunt.file.readJSON('package.json')
	}
	
  });
  
  // Telling Grunt to load plugins
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jade');
  
  // declaring the default action
  grunt.registerTask('default', ['jade:debug', 'copy:debug-bin','copy:debug']);
  grunt.registerTask('debug', ['jade:debug', 'copy:debug-bin','copy:debug']);
  grunt.registerTask('release', ['uglify:release', 'cssmin:release', 'jade:release', 'copy:release']);
  
};