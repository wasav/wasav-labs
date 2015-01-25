
module.exports = function(grunt) {

  grunt.initConfig({
	
	uglify:{
		release:{
			files:{
				'js/js-<%= pkg.name %>-<%= pkg.version %>.min.js': 
								'<%= js_files_in_order %>'
			}
		}
	},
	cssmin:{
		release:{
			files:{
				'css/css-<%= pkg.name %>-<%= pkg.version %>.min.css': 
								'<%= css_files_in_order %>'
			}
		}
	},
	pkg: grunt.file.readJSON('package.json'),
	css_files_in_order:['css-exploded/**/*.css'],
	js_files_in_order:['js-exploded/**/*.js']
	
  });
  
  // Telling Grunt to load plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  
  // declaring actions
  grunt.registerTask('default', ['cssmin:release', 'uglify:release']);
  
};