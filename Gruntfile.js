module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dev: {
                src: [

                    "src/config.js",
                    "src/index.js"
                ],
                dest: 'out/vrest.min.js'
            }

        },
        uglify: {
            options: {
                banner: '/*\n * <%= pkg.name %> \n' +
                ' * version <%= pkg.version %> \n' +
                ' * <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                ' * <%= pkg.description %> \n' +
                ' * © <%= grunt.template.today("yyyy") %> <%= pkg.author %> \n' +
                ' */ \n',
            },
            prod: {
                files: { 'out/vrest.min.js': ['<%= concat.dev.dest %>'] }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['concat', 'uglify']);
}; 