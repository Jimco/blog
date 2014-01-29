/**
 * Author: xjiancong@gmail.com
 * Date: 2014-01-29
 *
 *                       _oo0oo_
 *                      o8888888o
 *                      88" . "88
 *                      (| -_- |)
 *                      0\  =  /0
 *                    ___/'---'\___
 *                  .' \\|     |// '.
 *                 / \\|||  :  |||// \
 *                / _||||| -:- |||||- \
 *               |   | \\\  -  /// |   |
 *               | \_|  ''\---/''  |_/ |
 *               \  .-\__  '-'  ___/-. /
 *             ___'. .'  /--.--\  `. .'___
 *          ."" '<  '.___\_<|>_/___.'  >' "".
 *         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *         \  \ '_.   \_ __\ /__ _/   ._' /  /
 *     ====='-.____-.___ \_____/ ___.-____.-'=====
 *                       '=---='
 *
 *
 *     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 *                 佛祖保佑       永无BUG
 */
define("dist/jquery_placeholder",[],function(){function a(a){this.input=a,"password"==a.attr("type")&&this.handlePassword(),$(a[0].form).submit(function(){a.hasClass("placeholder")&&a[0].value==a.attr("placeholder")&&(a[0].value="")})}a.prototype={show:function(a){if(""===this.input[0].value||a&&this.valueIsPlaceholder()){if(this.isPassword)try{this.input[0].setAttribute("type","text")}catch(b){this.input.before(this.fakePassword.show()).hide()}this.input.addClass("placeholder"),this.input[0].value=this.input.attr("placeholder")}},hide:function(){if(this.valueIsPlaceholder()&&this.input.hasClass("placeholder")&&(this.input.removeClass("placeholder"),this.input[0].value="",this.isPassword)){try{this.input[0].setAttribute("type","password")}catch(a){}this.input.show(),this.input[0].focus()}},valueIsPlaceholder:function(){return this.input[0].value==this.input.attr("placeholder")},handlePassword:function(){var a=this.input;if(a.attr("realType","password"),this.isPassword=!0,$.browser.msie&&a[0].outerHTML){var b=$(a[0].outerHTML.replace(/type=(['"])?password\1/gi,"type=$1text$1"));this.fakePassword=b.val(a.attr("placeholder")).addClass("placeholder").focus(function(){a.trigger("focus"),$(this).hide()}),$(a[0].form).submit(function(){b.remove(),a.show()})}}};var b=!!("placeholder"in document.createElement("input"));$.fn.placeholder=function(){return b?this:this.each(function(){var b=$(this),c=new a(b);c.show(!0),b.focus(function(){c.hide()}),b.blur(function(){c.show(!1)}),$.browser.msie&&($(window).load(function(){b.val()&&b.removeClass("placeholder"),c.show(!0)}),b.focus(function(){if(""==this.value){var a=this.createTextRange();a.collapse(!0),a.moveStart("character",0),a.select()}}))})}});