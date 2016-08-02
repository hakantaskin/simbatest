import { app, BrowserWindow, dialog } from 'electron';
import jetpack from 'fs-jetpack';
var appDir = jetpack.cwd(app.getAppPath());
var package_json = appDir.read('package.json', 'json');
export var devMenuTemplate = {
    label: 'Development',
    submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function () {
            BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
        }
    },{
        label: 'Toggle DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: function () {
            BrowserWindow.getFocusedWindow().toggleDevTools();
        }
    },{
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function () {
            app.quit();
        }
    }]
};

export var prodMenuTemplate = {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: function(){
          var content_message = "Version: " + package_json.version + "\nCopyright: " + package_json.copyright;
          dialog.showMessageBox({type: "none", title: "About", message: content_message, buttons:["OK"]})
        }
      },
      {
        label: 'Reload',
        click: function () {
          BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
        }
      }
    ]
  };
