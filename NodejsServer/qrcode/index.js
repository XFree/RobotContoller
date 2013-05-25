var zxing = require('node-zxing')({ZXingLocation: __dirname + "/lib/zxing-2.2"});
var fs = require('fs');
var path = require('path');

var tempIndex = 0;


exports.recognize = function (_image, _callback, _ext) {
	tempIndex++;
	
	var fname = 'image' + tempIndex.toString() + "." + _ext || '.svg';
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