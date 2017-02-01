const remote = require('electron').remote;
const app = remote.app;
const { ipcRenderer, ipcMain } = require('electron');
import createWindow from './helpers/window';
import { get_website, url_generate, get_clean_caller_id, error_log, info_log } from './helpers/quick';
import jetpack from 'fs-jetpack';
import { get_caller_id, get_last_conn_id, get_user_name,
         get_last_direction, get_last_call_id, get_files_url,
         get_log_files_url, get_connection_id_by_data } from './call/xml';
import env from './env';

var os = require('os');
var fs = require('fs');
const http = require('http');
const Tail = require('tail').Tail;

var request = require('request');
var simba_file_path = 'C:\\Simbalauncher\\Simba\\';
var simba_log_file_path = 'C:\\Simbalauncher\\Simba\\Log\\';
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
var token = '';
var log_file = get_log_files_url();
var open_window_token = '';
var data = {};
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

var get_today = function(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!

  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  }
  if(mm<10){
      mm='0'+mm;
  }
  return yyyy+'_'+mm+'_'+dd;
}

var get_log_path = function(){
  return simba_log_file_path + get_today() + '\\';
}

var create_directory = function(){
  var log_path = get_log_path();
    if (!fs.exists(log_path)){
      try {
        fs.mkdir(log_path);
      } catch(err){}
    }
  return log_path;
}

var create_log_file = function(connectionid){
  var filename = get_log_path() + connectionid + ".txt";
  fs.open(filename,'r',function(err, fd){
    if (err) {
      fs.writeFile(filename, '', function(err) {
          if(err) {
              error_log(err);
          }
      });
    } else {
      fs.unlink(filename);
      fs.writeFile(filename, '', function(err) {
          if(err) {
              error_log(err);
          }
      });
    }
  });
  return true;
}

var append_log_file = function(connectionid, tail_data){
  var filename = get_log_path() + connectionid + ".txt";
  fs.open(filename,'r',function(err, fd){
    if (!err) {
      fs.appendFile(filename, '\r\n' + tail_data, function(err) {
          if(err) {
              error_log(err);
          }
      });
    } else {
      fs.writeFile(filename, '\r\n' + tail_data, function(err) {
          if(err) {
              error_log(err);
          }
      });
    }
  });
  return true;
}

var get_generate_filename = function(connectionid){
  return connectionid + ".txt";
}

var parser_log_file = function(connectionid){
  var filename = get_log_path() + connectionid + ".txt";
  var path_log_files = get_log_path();
  console.log(data);
  if(typeof data[connectionid]['last_direction'] != 'undefined' && typeof data[connectionid]['caller_id'] != 'undefined'){
    if(data[connectionid]['last_direction'] == true && data[connectionid]['caller_id'] == true){
      return true;
    }
  }
  var site = jetpack.read(simba_file_path + 'site.txt', 'txt');
  if (site == '') {
    return false;
  }
  var map_key = [];
  var map_value = [];

  var caller_id = get_caller_id(connectionid, path_log_files, get_generate_filename(connectionid));
  var last_direction = get_last_direction(path_log_files, get_generate_filename(connectionid));
  if(last_direction != ''){
    console.log("********* LAST DIRECTION ***********");
    console.log("Last direction:" + last_direction);
      data[connectionid].last_direction = true;
  }

  if(token == ''){
    error_log('Token not found');
    return false;
  }

  if (env.api_url.length < 1) {
    error_log("Api url not found");
    return false;
  }

  map_key = ["[agent]", "[token]"];
  map_value = [user_name, token];
  temp_url = url_generate(server_ip_text + env.api_url, map_key, map_value);

  var post_query = {
    "token": token,
    "direction": last_direction,
    "caller": caller_id,
    "agentip": agentip
  };

  request.post({url:temp_url, form:post_query, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    } else {
      error_log("Server error status code : " + response.statusCode + " url: " + temp_url);
    }
  });
  if(caller_id != ''){
    var map_screen_key = ["[callerid]", "[website]", "[uniqueid]"];
    var map_screen_value = [caller_id, site, token];

    var screen_temp_url = url_generate(env.call_screen, map_screen_key, map_screen_value);
    if(open_window_token != "callerid_" + caller_id + "_connectionid_" + connectionid) {
      open_window_token = "callerid_" + caller_id + "_connectionid_" + connectionid;
        var call_screen_options = {
          width: 800,
          height:600
        }
        if(caller_id.length > 5 && caller_id.indexOf('*') == -1){
          data[connectionid].caller_id = true;
          var win2 = ipcRenderer.send('newwindow', [token, screen_temp_url, caller_id, website, user_name]);
        }
        // Create a new window
    }
  }
}

var watch_file = function(){
  var last_conn_id = get_last_conn_id();
  var new_conn_id = '';
  var tail = new Tail(log_file);
  user_name = get_user_name();
  website = get_website(site);
  timestamp = new Date().getTime();
  create_directory();

  tail.on("line", function(tail_data) {
    new_conn_id = get_last_conn_id();
    if(last_conn_id != '' && last_conn_id != -1 && new_conn_id != -1 && new_conn_id != ''){
      if(new_conn_id != last_conn_id){
        data = {};
        data[new_conn_id] = {};
        data[new_conn_id]['last_direction'] = false;
        data[new_conn_id]['caller_id'] = false;
        last_conn_id = new_conn_id;
        append_log_file(last_conn_id, tail_data);
        var temp_api_token = url_generate(server_ip_text + env.api_token, ["[agent]"], [user_name]);
        var post_query = {
          "connection_id": last_conn_id,
          "website": website,
          "agentip": agentip
        };
        request.post({url:temp_api_token, form:post_query, json:true}, function (error, response, response_token) {
          if (!error && response.statusCode == 200) {
            token = response_token;
            parser_log_file(last_conn_id);
          } else {
            error_log("Server error status code: " + response.statusCode);
          }
        });
      } else {
        append_log_file(last_conn_id, tail_data);
        parser_log_file(last_conn_id);
      }
    }
  });

}

watch_file();
