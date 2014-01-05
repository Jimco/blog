/**
 * Timer Module
 */
define(function(require, exports, module){
  var util = require('./util');

  return function(ele){
    var timerTpl = '<span class="time_section"><span class="time_amount"><%= days %></span><br><%= months %></span><span class="time_section"><span class="time_amount"><%= hours %></span><br>Hour</span><span class="time_section"><span class="time_amount"><%= minutes%></span><br>Minute</span><span class="time_section"><span class="time_amount"><%= seconds %></span><br>Second</span>';

    setInterval(function() {
      var date = new Date()
        , aMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        , data = {
          days: date.getDate(),
          months: aMonth[date.getMonth()],
          seconds: date.getSeconds(),
          minutes: date.getMinutes(),
          hours: date.getHours()
        };

      ele.innerHTML = util.template(timerTpl, data);
    }, 1000);
  }

});