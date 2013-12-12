/**
 * xyBlog - 0.0.1
 * Email: xjiancong@gmail.com
 * Date: 2013-12-12
 */
define(function(require, exports, module){
  var util = require('./util')
    , placeholderPlugin = require('./jquery_placeholder');

  // placeholder 兼容插件调用
  $('input[placeholder], textarea[placeholder]').placeholder();




});
