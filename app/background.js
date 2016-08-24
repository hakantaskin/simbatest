// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.
import os from 'os';
import { app, Menu, ipcMain } from 'electron';
import { devMenuTemplate, prodMenuTemplate } from './helpers/dev_menu_template';
import { editMenuTemplate } from './helpers/edit_menu_template';
import createWindow from './helpers/window';
import jetpack from 'fs-jetpack';
import { error_log, info_log } from './helpers/quick';
const fs = require('fs');
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
 // module loaded from npm
var simba_file_path = 'C:\\Simbalauncher\\Simba\\';
import env from './env';
var site = jetpack.read( simba_file_path + 'site.txt', 'txt');
if(site == undefined) {
  fs.writeFile( simba_file_path + 'site.txt', '', (err) => {
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

app.on('ready', function () {
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
      new_window.loadURL('file://' + __dirname + '/views/form.html');
      new_window.webContents.on('did-finish-load', () => {
          new_window.webContents.send('windowname', [arg[0], arg[1], arg[2], arg[3], arg[4]]);
      });
      new_window.on('close', function(event_close){
        new_window.webContents.executeJavaScript(
          `
          window.onbeforeunload = function(e) {
            var webview_selector = document.querySelector('webview');
            if(webview_selector.src != 'http://metcase.metglobaltech.com/staff/index.php?/Mettask/Ticket/InsertSubmit') {
                alert("Formu doldurunuz.");
                return false;
            };
          }
          `
        );
      });
    });
});

app.on('window-all-closed', function (event) {
  if (process.platform != 'darwin'){
    app.quit();
  }
});
