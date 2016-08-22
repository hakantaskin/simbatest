const remote = require('electron').remote;
const app = remote.app;

console.log(app);

var caller_id = "";
var agent = "";
var token = "";

var retrive_object = localStorage.getItem();
