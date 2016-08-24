// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.
(function () {
    'use strict';
    var config = require('./../stylesheets/js/config');
    var { ipcRenderer, shell } = require('electron');
    var token = "";
    var url = "";
    var caller_id = "";
    var website = "";
    var agent = "";
    var tatilcom_url = "";
    var tab_group_last = "";
    var last_tab_div = "";
    var tab_group_last_attr_id = "";
    var new_data_id = "";

    //arg[0] => token, arg[1] => url, 2 => caller_id , 3 => website, 4 => agent
    ipcRenderer.on('windowname', (event, arg) => {
      token = arg[0];
      url = arg[1];
      caller_id = arg[2];
      website = arg[3];
      agent = arg[4];

      $(document).ready(function(){
        $('.tab-item-fixed').click(function(){
          console.log("tab_item_fixed_click");
          tatilcom_url = 'http://www.tatil.com?callcenter_refid='+token+'&callcenter_staffid='+agent+'&callcenter_callerid='+caller_id;
          tab_group_last = $('.tab_group').last();
          last_tab_div = $('div[class*="tab_div_"]').last();
          tab_group_last_attr_id = tab_group_last.attr('data-id');

          new_data_id = (parseInt(tab_group_last_attr_id) + 1);
          tab_group_last.after('<div class="tab-item tab_group" onclick="tab_group_click('+new_data_id+')" data-id="' + new_data_id + '"><span class="icon icon-cancel icon-close-tab" onclick="close_tab('+new_data_id+')"></span> Tatil.com Search</div>');
          last_tab_div.after('<div class="tab_div_' + new_data_id + '" style="display:none;"><webview id="webview_show" src="' + tatilcom_url + '" style="display:inline-flex; width:100%; position:absolute; top:48px; bottom:0;"></webview></div>');
          $('.tab_group').removeClass('active');
          $('div[class*="tab_div_"]').hide();
          $('.tab_group').last().addClass('active');
          $('.tab_div_' + new_data_id).show();

          var webview_show = document.getElementById('webview_show');

          webview_show.addEventListener('new-window', (e) => {
            console.log('new_window_eventttt' + new_data_id);
            webview_show.src = e.url;
          });
        });

        var webview = document.getElementById('webview_show');
        webview.addEventListener('new-window', (e) => {
          console.log('new_window');
        });

      });
      prepare(url, caller_id);
    });

    var prepare = function(url, caller_id){
      console.log("burada");
      document.querySelector('.tab_div_1').innerHTML = '<webview id="webview_show_1" src="' + url + '" style="display:inline-flex; width:100%; position:absolute; top:48px; bottom:0;"></webview>';
      document.querySelector('.phone_number').innerHTML = 'Phone Number :' + caller_id;
    }
}());
