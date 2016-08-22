// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.
(function () {
    'use strict';
    var config = require('./../stylesheets/js/config');
    var { ipcRenderer } = require('electron');
    //arg[0] => token, arg[1] => url, 2 => caller_id , 3 => website, 4 => agent
    ipcRenderer.on('windowname', (event, arg) => {
      var url = arg[1];
      var caller_id = arg[2];
      var website = arg[3];
      var agent = arg[4];
      console.log(url);
    });

}());
