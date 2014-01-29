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
define("dist/util",[],function(){var a={},b={throttle:function(a,b){var c,d,e,f,g,h,i=this.debounce(function(){g=f=!1},b);return function(){c=this,d=arguments;var j=function(){e=null,g&&a.apply(c,d),i()};return e||(e=setTimeout(j,b)),f?g=!0:h=a.apply(c,d),i(),f=!0,h}},debounce:function(a,b,c){var d;return function(){var e=this,f=arguments,g=function(){d=null,c||a.apply(e,f)};c&&!d&&a.apply(e,f),clearTimeout(d),d=setTimeout(g,b)}},setCookie:function(a,b,c){var d=new Date;c=c||7,d.setTime(d.getTime()+24*c*60*60*1e3),document.cookie=a+"="+b+"; expires="+d.toGMTString()+"; path=/"},getCookie:function(a){var b=a+"=";return document.cookie.length>0?(offset=document.cookie.indexOf(b),-1!=offset?(offset+=b.length,end=document.cookie.indexOf(";",offset),-1==end&&(end=document.cookie.length),document.cookie.substring(offset,end)):""):""},delCookie:function(a,b,c){this.setCookie(a,"","Thu, 01 Jan 1970 00:00:00 GMT",b,c)},JSONparse:function(a){return a&&"string"==typeof a?(a=a.trim(),window.JSON&&window.JSON.parse?window.JSON.parse(a):rValidchars.test(a.replace(rValidescape,"@").replace(rValidtokens,"]").replace(rValidbraces,""))?new Function("return "+a)():void 0):null},JSONstringify:function(a){if(window.JSON&&window.JSON.stringify)return JSON.stringify(a);var b=[];if("object"==typeof a){if(a instanceof Array){var c=[];b.push("[");for(var d=0;d<a.length;d++)c.push(this.JSONstringify(a[d]));b.push(c.join()),b.push("]")}else{b.push("{");var c=[];for(var e in a)c.push('"'+e+'":'+this.JSONstringify(a[e]));b.push(c.join()),b.push("}")}return b.join("")}return"number"!=typeof a?'"'+(a||"")+'"':a},loadJs:function(a,b,c){c=c||{};var d=document.getElementsByTagName("head")[0]||document.documentElement,e=document.createElement("script"),f=!1;e.src=a,c.charset&&(e.charset=c.charset),"async"in c&&(e.async=c.async||""),e.onerror=e.onload=e.onreadystatechange=function(){f||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(f=!0,b&&b(),e.onerror=e.onload=e.onreadystatechange=null,d.removeChild(e))},d.insertBefore(e,d.firstChild)},loadJsonp:function(){var a=1*new Date;return function(b,c,d){d=d||{};var e="XYJsonp"+a++,f=d.callbackReplacer||/%callbackfun%/gi;window[e]=function(a){c&&c(a),window[e]=null;try{delete window[e]}catch(b){}},f.test(b)?b=b.replace(f,e):b+=(/\?/.test(b)?"&":"?")+"callback="+e,this.loadJs(b,d.oncomplete,d)}}(),template:function(b,c){var d=/\W/.test(b)?new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+b.replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');"):a[b]=a[b]||this.template(document.getElementById(b).innerHTML);return c?d(c):d}};return b});