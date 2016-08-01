// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.
import os from 'os';
import { app, Menu, ipcMain } from 'electron';
import { devMenuTemplate } from './helpers/dev_menu_template';
import { editMenuTemplate } from './helpers/edit_menu_template';
import createWindow from './helpers/window';
import jetpack from 'fs-jetpack';
const fs = require('fs');
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
 // module loaded from npm
import env from './env';
var site = jetpack.read('site.txt', 'txt');
if(site == undefined) {
  console.log("undefined");
  fs.writeFile('./site.txt', '', (err) => {
    if (err) throw err;
  });
}
console.log(app.getPath('appData'));
var mainWindow;
var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    //if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    //}
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

app.on('ready', function () {
    setApplicationMenu();
    var url = 'file://' + __dirname + '/app.html';
    var settings_url = 'file://' + __dirname + '/views/site.html';
    var options = {
      width: 1000,
      height:600,
      show:true
    }

    var mainWindow = createWindow('main', options);
    var settings_options = {
      width: 350,
      height:150,
      parent:mainWindow
    }

    if( site == '' || site == undefined){
      var settingsWindow = createWindow('settings', settings_options)
    }

    mainWindow.loadURL(url);
    if(site.toString() == '' || site == undefined){
      settingsWindow.loadURL(settings_url);
    }

    if (env.name !== 'production') {
        mainWindow.openDevTools();
    }

    ipcMain.on('newwindow', (event, arg) => {
      var new_window_options = {
        width: 1200,
        height:600,
        webPreferences: {nodeIntegration:false}
      }
      //arg[0] => token, arg[1] => url
      var new_window = createWindow('new_window_' + arg[0], new_window_options);
      new_window.loadURL(arg[1]);
      new_window.on('close', function(event_close){
        new_window.webContents.executeJavaScript(
          `
          window.onbeforeunload = function(e) {
            if(document.querySelector('#fade-quote-carousel') == null) {
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
    event.preventDefault();
    app.quit();
});
