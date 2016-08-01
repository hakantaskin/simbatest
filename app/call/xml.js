const app = require('electron').remote.app
import jetpack from 'fs-jetpack'; // module loaded from npm
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var files = "\\Avaya\\Avaya one-X Communicator\\";
var log_files = "\\Avaya\\Avaya one-X Communicator\\Log Files\\";

export var get_caller_id = function () {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + log_files);
  var data = src.read(file_name, 'txt');
  var callerids = [];
  var i = 0;
  var result = data.match(/<remoteAddress>(.*?)<\/remoteAddress>/g).map(function(val){
    if(val.length > 0){
      callerids[i] = val.replace(/<\/?remoteAddress>/g,'');
      i++;
    }
  });
  if(callerids.length > 0){
      return callerids[(callerids.length - 1)];
  } else {
    console.error('callerid not found');
    return '';
  }

};

export var get_last_conn_id = function () {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + log_files);
  var data = src.read(file_name, 'txt');
  var connectionids = [];
  var i = 0;
  var result = data.match(/<connectionId>(.*?)<\/connectionId>/g).map(function(val){
     connectionids[i] = val.replace(/<\/?connectionId>/g,'');
     i++;
  });
  if(connectionids.length > 0){
      return connectionids[(connectionids.length - 1)];
  } else {
    console.error('connectionid not found');
    return '';
  }
}

export var get_last_direction = function () {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + log_files);
  var data = src.read(file_name, 'txt');
  var directions = [];
  var i = 0;
  var result = data.match(/<incoming>(.*?)<\/incoming>/g).map(function(val){
     directions[i] = val.replace(/<\/?incoming>/g,'');
     i++;
  });
  if(directions.length > 0){
    if (directions[(directions.length - 1)] == 'false'){
      return 'out';
    } else {
      return 'in';
    }
  } else {
    console.error('directions not found');
    return '';
  }
}

export var get_user_name = function () {
  var file_name = 'config.xml';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + files);
  var data = src.read(file_name, 'xml');
  var parameters = {};
  var user_name = '';
  console.log(path + files + file_name);
  parser.parseString(data, function (err, result) {
    if (err) throw err;
    parameters = result.ConfigData.parameter;
    parameters.forEach(function(parameter, key){
      if (typeof parameter.name['0'] != 'undefined' && parameter.name['0'] == 'SipUserAccount') {
        if (typeof parameter.value['0'] != 'undefined') {
          user_name =  parameter.value['0'];
        } else {
          console.error('username not found');
        }
      }
    });
  });

  return user_name;
}

export var get_last_call_id = function () {
  var file_name = 'history.xml';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + files);
  var data = src.read(file_name, 'xml');
  var next_session_id = '';
  parser.parseString(data, function(err, result) {
    if (typeof result.CallHistoryInformation.nextSessionId[0] != 'undefined') {
        next_session_id =  result.CallHistoryInformation.nextSessionId[0];
    } else {
      console.error ('next session id not found');
    }
  });

  return next_session_id;
}

export var get_files_url = function () {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  return (path + files + file_name);
}

export var get_log_files_url = function () {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  return (path + log_files + file_name);
}
