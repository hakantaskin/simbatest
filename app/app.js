const remote = require('electron').remote;
const app = remote.app;
const { ipcRenderer, ipcMain } = require('electron');
import createWindow from './helpers/window';
import { get_website, url_generate, get_clean_caller_id, error_log, info_log } from './helpers/quick';
import jetpack from 'fs-jetpack';
import { get_caller_id, get_last_conn_id, get_user_name,
         get_last_direction, get_last_call_id, get_files_url,
         get_log_files_url } from './call/xml';
import env from './env';

var os = require('os');
var fs = require('fs');
const http = require('http');
var request = require('request');
var simba_file_path = 'C:\\Simbalauncher\\Simba\\';
var site = jetpack.read(simba_file_path + 'site.txt');
var server_ip_text = '';
fs.readFile(simba_file_path + 'server_ip.txt', function (err, server_ip) {
  server_ip_text = server_ip;
});
var caller_id = '';
var last_conn_id = '';
var user_name = '';
var last_call_id = '';
var last_direction = '';
var temp_url = '';
var timestamp = '';
var website = '';
var new_token = '';
var log_file = get_log_files_url();
var open_window_token = '';
// set menu
var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};
//agent ip buluyoruz
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
var agentip = '';
if(typeof addresses[0] != 'undefined'){
  agentip = addresses[0];
}
//txt dinleme
var watch_file = function (){
  fs.watch(log_file, (event, filename) => {
    if(event == 'change'){
      user_name = get_user_name();
      website = get_website(site);
      timestamp = new Date().getTime();
      var temp_api_token = url_generate(server_ip_text + env.api_token, ["[agent]"], [user_name]);
      console.log("temp api token: " + temp_api_token);
      var new_conn_id = get_last_conn_id();
      if(new_conn_id != -1){
        if(new_conn_id != last_conn_id) {
          info_log('IF: New Conn ID: ' + new_conn_id + ' / Last Conn: ' + last_conn_id + ' / Token: ' + new_token);
          last_conn_id = new_conn_id;

          var post_query = {
            "connection_id": new_conn_id,
            "website": website,
            "agentip": agentip
          };

          request.post({url:temp_api_token, form:post_query, json:true}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              new_token = body;
              info_log("Conn ID: " + new_conn_id+ " / Token data event token: " + new_token);
              notifier_api(new_token, 'open', new_conn_id);
            } else {
              info_log("Server error status code : " + response.statusCode);
            }
          });
        }
      }
    }
  });
};

var notifier_api = function(funct_token, func_window, new_connection_id) {
  var site = jetpack.read(simba_file_path + 'site.txt', 'txt');
  if (site == '') {
    return false;
  }
  var map_key = [];
  var map_value = [];

  caller_id = get_caller_id(new_connection_id);
  last_direction = get_last_direction();
  if(funct_token == ''){
    info_log('Token not found');
    return false;
  }

  if (env.api_url.length < 1) {
    error_log("Api url not found");
    return false;
  }

  map_key = ["[agent]", "[token]"];
  map_value = [user_name, funct_token];
  temp_url = url_generate(server_ip_text + env.api_url, map_key, map_value);

  var post_query = {
    "token": funct_token,
    "direction": last_direction,
    "caller": caller_id
  };

  request.post({url:temp_url, form:post_query, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      info_log('Conn ID: ' + new_connection_id + ' / Token: '+ funct_token +' / Simba calllogs post ok.');
    } else {
      error_log("Server error status code : " + response.statusCode);
    }
  });
  if(caller_id != ''){
    var map_screen_key = ["[callerid]", "[website]", "[uniqueid]"];
    var map_screen_value = [caller_id, site, funct_token];

    var screen_temp_url = url_generate(env.call_screen, map_screen_key, map_screen_value);
    if(open_window_token != "callerid_" + caller_id + "_connectionid_" + new_connection_id) {
      open_window_token = "callerid_" + caller_id + "_connectionid_" + new_connection_id;
        var call_screen_options = {
          width: 800,
          height:600
        }
        if(caller_id.length > 5 && caller_id.indexOf('*') == -1){
          var win2 = ipcRenderer.send('newwindow', [funct_token, screen_temp_url, caller_id, website, user_name]);
        }
        // Create a new window
    }
  }
};

watch_file();
