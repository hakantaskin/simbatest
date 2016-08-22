const { ipcMain } = require('electron');

//arg[0] => token, arg[1] => url, 2 => caller_id , 3 => website, 4 => agent
ipcMain.on('windowname', (event, arg) => {
  console.log("main");
  console.log(arg);
}
