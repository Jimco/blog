define(function(require, exports, module){

  var Util = {

        throttle: function(func, wait){
          var context, args, timeout, throttling, more,result
            , whenDone = this.debounce(function(){
              more = throttling = false;  
            }, wait);

          return function(){
            context = this;
            args = arguments;
            var later = function(){
                timeout = null;
                if(more) func.apply(context, args);
                whenDone();
              };

            if(!timeout) timeout = setTimeout(later, wait);

            if(throttling){
              more = true;
            }
            else{
              result = func.apply(context, args);
            }

            whenDone();
            throttling = true;
            return result;
          }
        },

        debounce: function(func, wait, immediate){
          var timeout;
          return function(){
            var context = this
              , args = arguments
              , later = function(){
                timeout = null;
                if(!immediate) func.apply(context, args);
              };

            if(immediate && !timeout) func.apply(context, args);

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          }
        },

        setCookie: function(name, value, time){
          var date = new Date();
          time = time || 7;
          date.setTime(date.getTime() + time*24*60*60*1000);
          document.cookie = name + "=" + value + "; expires=" + date.toGMTString()+"; path=/";
        },

        getCookie: function(name){
          var search = name + '=';
          if(document.cookie.length > 0){ 
            offset = document.cookie.indexOf(search); 
              if(offset != -1){ 
                offset += search.length; 
                end = document.cookie.indexOf(';',offset); 
                if(end == -1) end = document.cookie.length;
                return document.cookie.substring(offset, end); 
              }else{
                return ''; 
              }
          }else{
            return '';
          }
        },

        delCookie: function(name, path, domain){
          this.setCookie( name, '', 'Thu, 01 Jan 1970 00:00:00 GMT', path, domain );
        },

        JSONparse: function( data ) {
          if ( !data || typeof data !== 'string' ){
            return null;
          }

          data = data.trim();
          
          // 标准浏览器可以直接使用原生的方法
          if( window.JSON && window.JSON.parse ){
            return window.JSON.parse( data );
          }
          
          if ( rValidchars.test( data.replace( rValidescape, '@' )
            .replace( rValidtokens, ']' )
            .replace( rValidbraces, '')) ) {

            return (new Function( 'return ' + data ))();
          }
        },

        JSONstringify: function (json) {
          if (window.JSON && window.JSON.stringify) {
            return JSON.stringify(json);
          }
          var html = [];
          if(typeof json == 'object') {
            if(json instanceof Array){
              var ar = [];
              html.push("[");
              for(var i = 0; i < json.length; i ++) {
                ar.push(this.JSONstringify(json[i]));
              }
              html.push(ar.join());
              html.push("]");
            } else {
              html.push("{");
              var ar = [];
              for(var p in json) {
                ar.push("\"" + p + "\":" + (this.JSONstringify(json[p])));
              }
              html.push(ar.join());
              html.push("}");
            }
            return html.join("");
          } else {
            if(typeof json !== 'number') {
              return "\"" + ( json || "" ) + "\"";
            } else {
              return json;
            }
          }
        },

        loadJs: function(url, callback, options) {
          options = options || {};
          var head = document.getElementsByTagName('head')[0] || document.documentElement
            , script = document.createElement('script')
            , done = false;

          script.src = url;
          if (options.charset) {
            script.charset = options.charset;
          }
          if ( 'async' in options ){
            script.async = options['async'] || '';
          }
          script.onerror = script.onload = script.onreadystatechange = function() {
            if(!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")){
              done = true;

              if(callback) callback();
              script.onerror = script.onload = script.onreadystatechange = null;
              head.removeChild(script);
            }
          };
          head.insertBefore(script, head.firstChild);
        },

        loadJsonp: (function(){
          var seq = new Date() * 1;
          return function (url , callback , options){
            options = options || {};
            var funName = "XYJsonp" + seq++
              , callbackReplacer = options .callbackReplacer || /%callbackfun%/ig;

            window[funName] = function (data){
              if(callback) callback(data);
              window[funName] = null;
              try{
                delete window[funName];
              }catch(e){};
            };

            if(callbackReplacer.test(url)){
              url = url.replace(callbackReplacer,funName);
            } 
            else{
              url += (/\?/.test( url ) ? '&' : '?') + 'callback=' + funName;
            }
            this.loadJs(url , options.oncomplete , options);
          };
        }())

    }

    return Util;
});