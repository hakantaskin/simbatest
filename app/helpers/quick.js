var fs = require('fs');
var simba_file_path = 'C:\\Simbalauncher\\Simba\\';
export var get_website = function (websiteid) {
  var website = "";
  switch(websiteid) {
    case "0":
        website =  'General';
        break;
    case "1":
        website = 'Otel.com';
        break;
    case "2":
        website = 'Tatil.com';
        break;
    case "4":
        website = 'Hotelspro';
        break;
    case "5":
        website = 'MetglobalDMC';
        break;
  }
  return website;
}

export var url_generate = function (temp_url, map_key, map_value) {
    map_key.forEach(function(value, key){
      temp_url = temp_url.replace(value, map_value[key]);
    });
    return temp_url;
}

export var get_clean_caller_id = function (callerid) {
  var map_caller_key = ["+", "@"];
  var map_caller_value = ["", "-"];
  map_key.forEach(function(value, key){
    callerid = temp_url.replace(value, map_value[key]);
  });
  return temp_url;
}

export var error_log = function (log) {
  var date = new Date().toISOString();
  console.error(log);
  fs.appendFile(simba_file_path + 'error_log.txt', "[ "+ date +" ] " + log + "\r\n", (err) => {
  if (err) throw err;
  });
}

export var info_log = function (log) {
  var date = new Date().toISOString();
  console.log(log);
  fs.appendFile(simba_file_path + 'info_log.txt', "[ "+ date +" ] " + log + "\r\n", (err) => {
  if (err) throw err;
  });
}
