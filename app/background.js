// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.
import os from 'os';
import { app, Menu, ipcMain, autoUpdater, dialog } from 'electron';
import { devMenuTemplate } from './helpers/dev_menu_template';
import { editMenuTemplate } from './helpers/edit_menu_template';
import createWindow from './helpers/window';
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
 // module loaded from npm
import env from './env';
import site from './site';
console.log(app.getPath('appData'));
var mainWindow;
var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    //if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    //}
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

var auto_update = function (mainWindow) {
  //set api url
  var feedUrl = 'http://localhost:3000/update/' + os.platform() + '?version=' + app.getVersion();
  console.log(feedUrl);
  autoUpdater.setFeedURL(feedUrl);

  //event handling after download new release
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {

    //confirm install or not to user
    var index = dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: [i18n.__('Restart'), i18n.__('Later')],
      title: "Typetalk",
      message: i18n.__('The new version has been downloaded. Please restart the application to apply the updates.'),
      detail: releaseName + "\n\n" + releaseNotes
    });

    if (index === 1) {
      return;
    }

    //restart app, then update will be applied
    autoUpdater.quitAndInstall();
  });
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
    if (os.platform() != 'darwin') {
        auto_update(mainWindow);
    }
    var settings_options = {
      width: 350,
      height:150,
      parent:mainWindow
    }

    if( site.id == ''){
      var settingsWindow = createWindow('settings', settings_options)
    }

    mainWindow.loadURL(url);
    mainWindow.on('close', function(event_close){
      event_close.preventDefault();
    });

    if(site.id == ''){
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
