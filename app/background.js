// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.
import os from 'os';
import { app, Menu, ipcMain, Tray } from 'electron';
import { devMenuTemplate, prodMenuTemplate } from './helpers/dev_menu_template';
import { editMenuTemplate } from './helpers/edit_menu_template';
import createWindow from './helpers/window';
import jetpack from 'fs-jetpack';
import { error_log, info_log } from './helpers/quick';
const fs = require('fs');
var gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
 // module loaded from npm
var simba_file_path = 'C:\\Simbalauncher\\Simba\\';
var simba_log_file_path = 'C:\\Simbalauncher\\Simba\\Log\\';

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

import env from './env';
var site = jetpack.read( simba_file_path + 'site.txt', 'txt');
var server_ip = jetpack.read( simba_file_path + 'server_ip.txt', 'txt');
if(site == undefined) {
  fs.writeFile( simba_file_path + 'site.txt', '', (err) => {
    if (err){
      info_log(err);
    }
  });
}

if(server_ip == undefined || server_ip.length < 20){
  fs.writeFile( simba_file_path + 'server_ip.txt', 'http://172.22.3.199:4567', (err) => {
    if (err){
      info_log(err);
    }
  });
}

var mainWindow;
var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    //if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    //}
    menus.push(prodMenuTemplate);
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

var create_directory = function(){
  var log_path = get_log_path();
  fs.stat(log_path, function(err, stats) {
    if(err){
      try{
        fs.mkdir(log_path);
      } catch(try_error){
        error_log(dumpError(try_error));
      }
    }
  });
  return log_path;
}

let tray = null
app.on('ready', function () {
  try{
    create_directory();
    tray = new Tray('C:/Simbalauncher/icon.ico');
    tray.setToolTip('Simba is running.');
    setApplicationMenu();
    var url = 'file://' + __dirname + '/app.html';
    var settings_url = 'file://' + __dirname + '/views/site.html';
    var options = {
      width: 1000,
      height:600,
      show:false
    }

    var mainWindow = createWindow('main', options);
    var settings_options = {
      width: 350,
      height:300,
      parent:mainWindow
    }

    if( site == '' || site == undefined){
      var settingsWindow = createWindow('settings', settings_options)
    }

    mainWindow.loadURL(url);
    if(site == '' || site == undefined){
      settingsWindow.loadURL(settings_url);
    }

    if (env.name !== 'production') {
        mainWindow.openDevTools();
    }

    ipcMain.on('newwindow', (event, arg) => {
      var new_window_options = {
        width: 1200,
        height:600
      }

      //arg[0] => token, arg[1] => url, 2 => caller_id , 3 => website, 4 => agent
      var new_window = createWindow('new_window_' + arg[0], new_window_options);
      new_window.maximize();
      new_window.loadURL('file://' + __dirname + '/views/form.html');
      new_window.webContents.on('did-finish-load', () => {
          new_window.webContents.send('windowname', [arg[0], arg[1], arg[2], arg[3], arg[4], arg[5]]);
      });
      new_window.on('close', function(event_close){
        new_window.webContents.executeJavaScript(
          `
          window.onbeforeunload = function(e) {
            var webview_selector = document.querySelector('webview');
            var src = webview_selector.src;
            if(src.indexOf('http://metcase.metglobaltech.com/staff/index.php?/Mettask/Ticket/CallCenter/') != -1) {
                alert("Formu doldurunuz.");
                return false;
            };
          }
          `
        );
      });
    });
  } catch(app_err){
    error_log(app_err);
  }
});

app.on('window-all-closed', function (event) {
  if (process.platform != 'darwin'){
    app.quit();
  }
});
