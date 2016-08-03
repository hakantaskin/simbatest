const remote = require('electron').remote;
const app = remote.app;
const {ipcRenderer} = require('electron');
import createWindow from './helpers/window';
import { get_website, url_generate, get_clean_caller_id, error_log, info_log } from './helpers/quick';
import jetpack from 'fs-jetpack';
import { get_caller_id, get_last_conn_id, get_user_name,
         get_last_direction, get_last_call_id, get_files_url,
         get_log_files_url } from './call/xml';
import env from './env';

var fs = require('fs');
const http = require('http');
var request = require('request');
var site = jetpack.read('site.txt');

var caller_id = '';
var last_conn_id = '';
var user_name = '';
var last_call_id = '';
var last_direction = '';
var temp_url = '';
var timestamp = '';
var website = '';
var token = '';
var first_conn_id = '';
var open_window = '';
var log_file = get_log_files_url();
var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

var watch_file = function (){
  fs.watch(log_file, (event, filename) => {
    if(event == 'change'){
      first_conn_id = '';
      open_window = '';
      user_name = get_user_name();
      var temp_api_token = url_generate(env.api_token, ["[agent]"], [user_name]);
      var new_conn_id = get_last_conn_id();
      if(new_conn_id != last_conn_id) {
        info_log('IF: New Conn: ' + new_conn_id + ' / Last Conn: ' + last_conn_id + ' / Token: ' + token);
        last_conn_id = get_last_conn_id();
        open_window = 'open';
        http.get(temp_api_token, (res) => {
          res.on("data", function(chunk) {
            token = chunk;
            notifier_api(token);
          });
        }).on('error', (e) => {
          error_log('Got error: ' + e.message);
        });
      } else {
        info_log('ELSE: New Conn: ' + new_conn_id + ' / Last Conn: ' + last_conn_id + ' / Token: ' + token);
        notifier_api(token);
      }
    }
  });
};

var notifier_api = function(token) {
  var site = jetpack.read('site.txt', 'txt');
  if (site == '') {
    return false;
  }
  var new_conn_id = get_last_conn_id();
  var map_key = [];
  var map_value = [];

  caller_id = get_caller_id();
  user_name = get_user_name();
  last_direction = get_last_direction();
  website = get_website(site);
  timestamp = new Date().getTime();
  if(token == ''){
    info_log('Token not found');
    return false;
  }

  if (env.api_url.length < 1) {
    error_log("Api url not found");
    return false;
  }

  map_key = ["[agent]", "[token]"];
  map_value = [user_name, token];
  temp_url = url_generate(env.api_url, map_key, map_value);
  var post_query = {
    "token": token,
    "direction": last_direction,
    "caller": caller_id,
    "agent": user_name,
    "timestamp": timestamp,
    "connection_id": last_conn_id
  };
  request.post({url:temp_url, form:post_query, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    } else {
      error_log("Server error status code : " + response.statusCode);
    }
  });

  var map_screen_key = ["[callerid]", "[website]", "[uniqueid]"];
  var map_screen_value = [caller_id, site, token];

  var screen_temp_url = url_generate(env.call_screen, map_screen_key, map_screen_value);
  if (open_window == 'open') {
      var call_screen_options = {
        width: 800,
        height:600
      }
      // Create a new window
      var win2 = ipcRenderer.send('newwindow', [token, screen_temp_url]);
  }
};

watch_file();
