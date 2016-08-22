(function () {
  'use strict';

  var config = require('./../stylesheets/js/config');
  var remote = require('electron').remote;
  var { ipcMain, ipcRenderer } = require('electron');
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
