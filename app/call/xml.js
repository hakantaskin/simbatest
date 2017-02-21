const app = require('electron').remote.app
import jetpack from 'fs-jetpack'; // module loaded from npm
var fs = require('fs');
var gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var simba_file_path = 'C:\\Simbalauncher\\Simba\\';

var files = "\\Avaya\\Avaya one-X Communicator\\";
var log_files = "\\Avaya\\Avaya one-X Communicator\\Log Files\\";

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var info_log = function (log) {
  var date = new Date().toISOString();
  fs.appendFile(simba_file_path + 'info_log.txt', "[ "+ date +" ] " + log + "\r\n", (err) => {
  if (err) throw err;
  });
}

var get_caller_id_parse = function (data) {
  var callerids = [];
  var i = 0;
  var caller_id = '';
  var result = data.match(/<remoteAddress>(.*?)<\/remoteAddress>/g);
  var caller_number = '';
  var caller_error = false;
  if(result != null){
    result.map(function(val){
      if(val.length > 0){
        caller_number = val.replace(/<\/?remoteAddress>/g,'');
        callerids[i] = caller_number;
        if(caller_number != '' && caller_number != '444'){
            i++;
        } else {
          caller_error = true;
        }
      }
    });
  }

  if(caller_error == true || result == null){
    result = data.match(/<remoteUserName>(.*?)<\/remoteUserName>/g);
    if(result != null){
      result.map(function(val){
        if(val.length > 0){
          caller_number = val.replace(/<\/?remoteUserName>/g,'');
          callerids[i] = caller_number;
          if(caller_number != '' && caller_number != '444'){
              i++;
          }
        }
      });
    } else {
      return '';
    }
  }

  if(callerids.length > 0){
      caller_id = callerids[(callerids.length - 1)];
      caller_id = replaceAll(caller_id, '@', '');
      caller_id = replaceAll(caller_id, '[+]', '');
      caller_id = replaceAll(caller_id, '-', '');
      caller_id = caller_id.trim();
      caller_id = caller_id.substring(0,15);
      caller_id = caller_id.trim();
      if(!isNumeric(caller_id) && caller_id.indexOf('*') == -1){
        for(i = caller_id.length; i > 0; i--){
          if(isNumeric(caller_id.substring(0,i))){
            return caller_id.substring(0,i);
          }
        }
        caller_id = '';
      }
  } else {
    info_log('callerid not found');
  }
  return caller_id;
};

export var get_caller_id = function (last_conn_id, path_log_files = '', filename = '') {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData');
  var src = path + log_files;
  if(path_log_files != ''){
    src = path_log_files;
  }
  if(filename != ''){
    file_name = filename;
  }
  fs.stat(path_log_files + file_name, function (err, stats) {
        if (err) {
            info_log(err);
            return ''; // exit here since stats will be undefined
        } else {
          console.log(path_log_files + file_name);
          var data = gracefulFs.readFileSync(path_log_files + file_name).toString();
          var callerids = [];
          var connection_ids = [];
          var last_connection_id = 0;
          var i = 0;
          var connectionId_i = 0;
          var caller_id = '';
          var caller_id_last_string = '';
          var incoming_strings = [];
          var incoming_last_string = '';
          if(typeof data != 'undefined'){
              var result = data.match(/<IncomingSessionEvent xmlns="http:\/\/xml.avaya.com\/endpointAPI">[\s\S]*?<\/IncomingSessionEvent>/g);
          } else {
            var result = null;
          }

          if(result != null){
            result.map(function(val){
              if(val.length > 0){
                incoming_strings[i] = val;
                i++;
              }
            });
            if(incoming_strings.length > 0){
              incoming_last_string = incoming_strings[(incoming_strings.length - 1)];
              if(incoming_last_string != ''){
                var result_connection = incoming_last_string.match(/<connectionId>(.*?)<\/connectionId>/g);
                if(result_connection != null){
                  var result_connection_id = result_connection.map(function(val_connection){
                    if(val_connection.length > 0){
                      connection_ids[connectionId_i] = val_connection.replace(/<\/?connectionId>/g,'');
                      connectionId_i++;
                    }
                  });
                }
                if(connection_ids.length > 0){
                  if(connection_ids[(connection_ids.length - 1)] == last_conn_id){
                      last_connection_id = connection_ids[(connection_ids.length - 1)];
                      caller_id_last_string = incoming_last_string;
                      caller_id = get_caller_id_parse(caller_id_last_string);
                      if(caller_id != '' && caller_id != '444'){
                        return caller_id;
                      }
                  }
                } else {
                  info_log('connection id not found');
                }
              }
            }
          }

          var caller_id_2 = get_caller_id_2(last_conn_id);
          if(caller_id_2 != ''){
            last_connection_id = connection_ids[(connection_ids.length - 1)];
            caller_id_last_string = caller_id_2;
            caller_id = get_caller_id_parse(caller_id_last_string);
            if(caller_id != '' && caller_id != '444'){
              return caller_id;
            }
          }

          var caller_id_3 = get_caller_id_3(last_conn_id)
          if(caller_id_3 != ''){
            last_connection_id = connection_ids[(connection_ids.length - 1)];
            caller_id_last_string = caller_id_3;
            caller_id = get_caller_id_parse(caller_id_last_string);
            if(caller_id != '' && caller_id != '444'){
              return caller_id;
            }
          }

          return caller_id;
        }
  });
  return '';
};

var get_caller_id_2 = function (last_conn_id) {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + log_files);
  var data = src.read(file_name, 'txt');
  var callerids = [];
  var connection_ids = [];
  var last_connection_id = 0;
  var i = 0;
  var connectionId_i = 0;
  var caller_id = '';
  var caller_id_last_string = '';
  var incoming_strings = [];
  var incoming_last_string = '';
  var result = data.match(/<SessionCreatedEvent xmlns="http:\/\/xml.avaya.com\/endpointAPI">[\s\S]*?<\/SessionCreatedEvent>/g);
  if(result == null){
    return '';
  }
  result.map(function(val){
    if(val.length > 0){
      incoming_strings[i] = val;
      i++;
    }
  });
  if(incoming_strings.length > 0){
    incoming_last_string = incoming_strings[(incoming_strings.length - 1)];
    if(incoming_last_string != ''){
      var result_connection = incoming_last_string.match(/<connectionId>(.*?)<\/connectionId>/g);
      if(result_connection != null){
        var result_connection_id = result_connection.map(function(val_connection){
          if(val_connection.length > 0){
            connection_ids[connectionId_i] = val_connection.replace(/<\/?connectionId>/g,'');
            connectionId_i++;
          }
        });
      }
      if(connection_ids.length > 0){
        if(connection_ids[(connection_ids.length - 1)] == last_conn_id){
            last_connection_id = connection_ids[(connection_ids.length - 1)];
            caller_id_last_string = incoming_last_string;
        }
      } else {
        info_log('connection id not found');
      }
    }
  }

  return caller_id_last_string;
}

var get_caller_id_3 = function (last_conn_id) {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + log_files);
  var data = src.read(file_name, 'txt');
  var callerids = [];
  var connection_ids = [];
  var last_connection_id = 0;
  var i = 0;
  var connectionId_i = 0;
  var caller_id = '';
  var caller_id_last_string = '';
  var incoming_strings = [];
  var incoming_last_string = '';
  var result = data.match(/<SessionUpdatedEvent xmlns="http:\/\/xml.avaya.com\/endpointAPI">[\s\S]*?<\/SessionUpdatedEvent>/g);
  if(result == null){
    return '';
  }
  result.map(function(val){
    if(val.length > 0){
      incoming_strings[i] = val;
      i++;
    }
  });
  if(incoming_strings.length > 0){
    for(var a = 1; a <= incoming_strings.length; a++){
      incoming_last_string = incoming_strings[(incoming_strings.length - a)];
      if(incoming_last_string != ''){
        var result_connection = incoming_last_string.match(/<connectionId>(.*?)<\/connectionId>/g);
        if(result_connection != null){
          var result_connection_id = result_connection.map(function(val_connection){
            if(val_connection.length > 0){
              connection_ids[connectionId_i] = val_connection.replace(/<\/?connectionId>/g,'');
              connectionId_i++;
            }
          });
        }
        if(connection_ids.length > 0){
          if(connection_ids[(connection_ids.length - 1)] == last_conn_id){
              last_connection_id = connection_ids[(connection_ids.length - 1)];
              caller_id = get_caller_id_parse(incoming_last_string);
              if(caller_id != '' && caller_id != '444'){
                  return incoming_last_string;
              }
          }
        } else {
          info_log('connection id not found');
        }
      }
    }
  }
  return caller_id_last_string;
}

export var get_last_conn_id = function () {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + log_files);
  var data = src.read(file_name, 'txt');
  var connectionids = [];
  var i = 0;
  var match_result = data.match(/<connectionId>(.*?)<\/connectionId>/g);
  if(match_result != null){
    var result = match_result.map(function(val){
       connectionids[i] = val.replace(/<\/?connectionId>/g,'');
       i++;
    });
  }

  if(connectionids.length > 0){
      return connectionids[(connectionids.length - 1)];
  } else {
    info_log('connectionid not found');
    return '';
  }
}

export var get_last_direction = function (path_log_files = '', filename = '') {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + log_files);
  if(path_log_files != ''){
    src = jetpack.cwd(path_log_files);
  }
  if(filename != ''){
    file_name = filename;
  }
  var data = src.read(file_name, 'txt');
  var directions = [];
  var i = 0;
  if(typeof data != 'undefined'){
    var match_result = data.match(/<incoming>(.*?)<\/incoming>/g);
    if(match_result != null){
      var result = match_result.map(function(val){
         directions[i] = val.replace(/<\/?incoming>/g,'');
         i++;
      });
    }
    if(directions.length > 0){
      if (directions[(directions.length - 1)] == 'false'){
        return 'out';
      } else {
        return 'in';
      }
    }
  }

  return '';
}

export var get_last_direction_by_taildata = function (data) {
  var directions = [];
  var i = 0;
  if(typeof data != 'undefined'){
    var match_result = data.match(/<incoming>(.*?)<\/incoming>/g);
    if(match_result != null){
      var result = match_result.map(function(val){
         directions[i] = val.replace(/<\/?incoming>/g,'');
         i++;
      });
    }
    if(directions.length > 0){
      if (directions[(directions.length - 1)] == 'false'){
        return 'out';
      } else {
        return 'in';
      }
    }
  }

  return '';
}

export var get_user_name = function () {
  var file_name = 'config.xml';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + files);
  var data = src.read(file_name, 'xml');
  var parameters = {};
  var user_name = '';
  parser.parseString(data, function (err, result) {
    if (err) throw err;
    parameters = result.ConfigData.parameter;
    parameters.forEach(function(parameter, key){
      if (typeof parameter.name['0'] != 'undefined' && parameter.name['0'] == 'SipUserAccount') {
        if (typeof parameter.value['0'] != 'undefined') {
          user_name =  parameter.value['0'];
        } else {
          info_log('username not found');
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
      info_log ('next session id not found');
    }
  });

  return next_session_id;
}

export var get_created_event = function () {
  var file_name = 'onexcapi.txt';
  var path = app.getPath('appData'); // appData ile degisecek
  var src = jetpack.cwd(path + log_files);
  var data = src.read(file_name, 'txt');
  var created_event = [];
  var i = 0;
  var result = data.match(/<SessionCreatedEvent xmlns="http:\/\/xml.avaya.com\/endpointAPI">(.*?)<\/SessionCreatedEvent>/g).map(function(val){
     created_event[i] = result;
     i++;
  });
  if(created_event.length > 0){
    return created_event[(created_event.length - 1)];
  } else {
    info_log('created event not found');
    return '';
  }
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

export var get_connection_id_by_data = function (data) {
  var connectionids = [];
  var i = 0;
  var match_result = data.match(/<connectionId>(.*?)<\/connectionId>/g);
  if(match_result != null){
    var result = match_result.map(function(val){
       connectionids[i] = val.replace(/<\/?connectionId>/g,'');
       i++;
    });
  }

  if(connectionids.length > 0){
      return connectionids[(connectionids.length - 1)];
  } else {
      return '';
  }
}
