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
