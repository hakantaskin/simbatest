const { ipcRenderer } = require('electron');

ipcRenderer.on('windowname', (event, arg) => {
  var window_name = arg[0];
  var retrieve_object = localStorage.getItem(window_name);
  console.log(retrieve_object);
}
