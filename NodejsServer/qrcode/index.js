var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;


function makeZxing(options) {
  var defaults = options || {};

  if(defaults.ZXingLocation == null) {
    defaults.ZXingLocation = "";
  }

  var commandLineOptions = " ";
  if(defaults.try_harder) {
    commandLineOptions += "--try_harder ";
  }
  return {
    decode: function(_path, _cb) {
		var cmdline = 'java -cp '+defaults.ZXingLocation+path.sep+'javase.jar'+path.delimiter+defaults.ZXingLocation+path.sep+'core.jar com.google.zxing.client.j2se.CommandLineRunner'+commandLineOptions+''+_path;
		//console.log(cmdline);
        exec(cmdline, 
        function(err, stdout, stderr){
          var qrcode = "";
          var errorCache = null;
          //console.log(err, stdout, stderr);
          if(err !== null) {
            //console.log(err, stdout, stderr);
            errorCache = err;
          } else {
            var lines = stdout.split("\n");

            for(var i in lines) {
              if(lines[i] == 'Raw result:') {
                qrcode = lines[parseInt(i)+1];
                break;
              }
            }
            
          }
          _cb(errorCache, qrcode);
        }
      );
    }
  };
}


var tempIndex = 0;
var zxing = makeZxing({ZXingLocation: __dirname + "/lib/zxing-2.2"});


exports.recognize = function (_image, _callback, _ext) {
	tempIndex++;
	
	var fname = 'image' + tempIndex.toString() + "." + (_ext || 'png');
	var tpath = path.join(__dirname, 'temp');
	var fpath = path.join(tpath, fname);
	
	if (!fs.existsSync(tpath)) fs.mkdirSync(tpath);
	if (fs.existsSync()) fs.unlinkSync(fpath);
	
	fs.writeFileSync(fpath, _image);

	zxing.decode(fpath, function (_error, _text) {
		fs.unlinkSync(fpath);

		_callback && _callback(_text, _error);
	});
}