var events = require('events');
var fs = require('fs');
var qr = require('../qrcode');


function drone(_client) {
	this.navdata = {
		droneState: {flying: 0},
		droneDemo: {"accel" : 1, "batery: ": 14}};
	this.listener = new events.EventEmitter();
	
	this.lastImage = null;
	this.recognizingImages = 0;

	  
	this.qrcodes = [];
	this.error = "";
}


drone.prototype.updateImage = function (_image) {
  var self = this;
  self.lastImage = _image;
  
  if (self.recognizingImages < 10) {
	  ++self.recognizingImages;
	  qr.recognize(_image, function (_text,_error) {
		--self.recognizingImages
    	if (_text) {
			self.updateQrcode(_text);
			self.pushQrcodes();
	    }
	  });
	}
}


drone.prototype.updateQrcode = function (_text) {
	var i = 0, n = this.qrcodes.length;
	for (; i < n; ++i) {
		if (this.qrcodes[i] === _text) break;
	}
	if (i == n) this.qrcodes.push(_text);
}



drone.prototype.pushReady = function () {
	//console.log("drone::pushReady. %j", this);
	if (this.listener) {
		this.listener.emit('ready',  this);
	}
}


drone.prototype.pushState = function () {
	//console.log("drone::pushState. %j", this);
	if (this.listener) {
		this.listener.emit('state', this);
	}
}


drone.prototype.pushImage = function() {
	//console.log("drone::pushImage. %j", this);
	if (this.listener) {
		this.listener.emit('image', this);
	}
}



drone.prototype.pushQrcodes = function () {
	//console.log("drone::pushQrcodes. %j", this);
	if (this.listener) {
		this.listener.emit('qrcodes', this);
	}
}




drone.prototype.takeoff = function (_callback) {
	//console.log('drone::takeoff');
	
	this.navdata.droneState.flying = true;
	this.pushState();
	_callback && _callback();
	
}


drone.prototype.land = function () {
	//console.log('drone::land');
	this.navdata.droneState.flying = false;
	this.pushState();
}


drone.prototype.move = function (_command) {
	console.log('drone::move(%j)', _command);
}

drone.prototype.stop = function () {
	console.log('drone::stop()');
}



drone.instance = null;
drone.error = null;

function emuState() {
	//console.log("emuState: %j", drone.instance);
	setTimeout(function () {
		if (drone.instance) {
			drone.instance.pushState();
		}
		emuState();
	}, 500);

}


function emuImage() {
	//console.log("emuImage: %j", drone.instance);
	setTimeout(function () {
		
		if (drone.instance) {
			var sample = __dirname + '/sample.png';
			if (fs.existsSync(sample)) {
				drone.instance.updateImage(fs.readFileSync(sample));
				drone.instance.pushImage();
			}
		}
		
		emuImage();
	}, 700);
}

var ii = 0;
function emuQrcodes() {
	//console.log("emuImage: %j", drone.instance);
	setTimeout(function () {
		
		if (drone.instance) {
			drone.instance.updateQrcode('Test ' + ii % 10);
			drone.instance.pushQrcodes();
			++ii;
		}
		emuQrcodes();
	}, 1500);
}




drone.get = function(_ip) {
	drone.error = null;
	if (!drone.instance)	{
		try {
			drone.instance = new drone();
			
			emuState();
			emuImage();
			emuQrcodes();
			
		}
		catch (e) {
			drone.error = e.message;
		}
	}
	return drone.instance;
}


exports.drone = drone;
