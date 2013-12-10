'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // 清除临时文件
    clean: {
      main: ['static/js/.tmp*']        // 需要清除的文件夹名称
    },
    // 提取依赖
    transport: {
      options: {
        path: ['js'],           // 模块的 id 格式
        alias: '<%= pkg.alias %>'
      },
      js: {
        options: {
          idleading: 'dist/'    // 模块的 id 格式
        },
        files: [{
          expand: true,
          cwd: 'static/js/src',              // 相对路径
          src: '*.js',                       // 需要提取依赖的文件
          dest: 'static/js/.tmp1'            // 提取后存放的临时文件
        }]
      }
    },
    // 合并
    concat: {
      options: {
        include: 'relative'  // 合并模式(relative: 只合并相对路径的模块, all: 合并所有模块)
      },
      js: {
        files: [{
          expand: true,
          cwd: 'static/js/.tmp1',         // 需要合并的文件夹路径
          src: '*.js',                    // 需要合并的文件
          filter: function(filepath) {
            return !/-debug\.js$/.test(filepath); // 筛选非 -dubug.js 结尾的文件
          },
          dest: 'static/js/.tmp2',        // 合并后的存放路径
          ext: '.js'                      // 合并后的扩展名
        }]
      }
    },
    // 压缩
    uglify: {
      options: {
        banner: '/**\n' +
                ' * Author: xjiancong@gmail.com\n' +
                ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n *\n' +
                ' *                       _oo0oo_\n'+
                ' *                      o8888888o\n'+
                ' *                      88" . "88\n'+
                ' *                      (| -_- |)\n'+
                ' *                      0\\  =  /0\n'+
                ' *                    ___/\'---\'\\___\n'+
                ' *                  .\' \\\\|     |// \'.\n'+
                ' *                 / \\\\|||  :  |||// \\\n'+
                ' *                / _||||| -:- |||||- \\\n'+
                ' *               |   | \\\\\\  -  /// |   |\n'+
                ' *               | \\_|  \'\'\\---/\'\'  |_/ |\n'+
                ' *               \\  .-\\__  \'-\'  ___/-. /\n'+
                ' *             ___\'. .\'  /--.--\\  `. .\'___\n'+
                ' *          ."" \'<  \'.___\\_<|>_/___.\'  >\' "".\n'+
                ' *         | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |\n'+
                ' *         \\  \\ \'_.   \\_ __\\ /__ _/   ._\' /  /\n'+
                ' *     =====\'-.____-.___ \\_____/ ___.-____.-\'=====\n'+
                ' *                       \'=---=\'\n *\n *\n'+
                ' *     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n *\n'+
                ' *                 佛祖保佑       永无BUG\n'+
                ' */\n'
      },
      js: {
        files: [{
          expand: true,
          cwd: 'static/js/.tmp2',       // 需要压缩的文件夹路径
          src: '*.js',                  // 需要压缩的文件
          dest: 'static/js/dist',       // 压缩后的存放路径
          ext: '.js'                    // 压缩后的扩展名
        }]
      }
    }
  });

  // 加载依赖组件
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-cmd-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // 注册默认任务
  grunt.registerTask('default', ['clean', 'transport', 'concat', 'uglify', 'clean']);

};
