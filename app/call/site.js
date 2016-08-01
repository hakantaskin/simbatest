// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.
(function () {
    'use strict';
    var config = require('./../stylesheets/js/config');
    var remote = require('electron').remote;
    var jetpack = require('fs-jetpack'); // module loaded from npm
    var env = require('./../env');
    var jsonfile = require('jsonfile');

    console.log('Loaded environment variables:', env);
    var app = remote.app;
    var appDir = jetpack.cwd(app.getAppPath());

    var config_file = '../site.txt';

    $(document).ready(function(){
      $('.set_website').click(function(){
        var attr_id = $(this).attr('attr-id');
        var obj = {id: attr_id};

        jetpack.write(config_file, obj, function (err){
          if(err != null){
              console.error(err);
          }
        });

        jetpack.read(config_file, function(err, site) {
          if (err != null){
            console.error(err);
          }
          if (site != ""){
            alert('Site id güncellendi');
            console.log('Site id güncellendi - ' + site);
          } else {
            console.error('Site id değiştirilirken sorun oluştu');
          }
        });

      });
    });

}());
