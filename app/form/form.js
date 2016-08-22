(function () {
  'use strict';

  const electron = require('electron');
  const ipcMain = electron.ipcMain;
  const ipcRenderer = electron.ipcRenderer;
  //arg[0] => token, arg[1] => url, 2 => caller_id , 3 => website, 4 => agent
  ipcMain.on('windowname', (event, arg) => {
    console.log("main");
    console.log(arg);
  });

  //arg[0] => token, arg[1] => url, 2 => caller_id , 3 => website, 4 => agent
  ipcRenderer.on('windowname', (event, arg) => {
    console.log("renderer");
    console.log(arg);
  });

}());
