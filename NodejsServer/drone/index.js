var droneApi = require('ar-drone');
var events = require('events');
var rqcodes = require('../qrcode');

function drone(_client) {
  this.name = "drone";
  this.client = _client;
  this.stream = null;
  this.listener = null;

  this.navdata = {};

  this.lastIimage = null;
  this.rqcodes = [];
  this.error = "";
}

drone.prototype.updateState = function (_navdata) {
  if (_navdata.droneState && _navdata.demo)  {
    this.navdata = _navdata;
  }
}


drone.prototype.updateImage = function (_image) {
  this.lastIimage = _image;
}


drone.prototype.updateQrcode = function (_text) {
  this.qrcodes.push(_text);
}



drone.prototype.pushReady = function () {
  var self = this;
  if (self.listener) {
    self.listener.emit('ready', self);
  }
}


drone.prototype.pushState = function () {
  var self = this;
  if (self.listener) {
    self.listener.emit('state', self);
  }
}


drone.prototype.pushImage = function() {
  var self = this;
  if (self.listener) {
    self.listener.emit('image', self);
  }
}



drone.prototype.pushQrcodes = function () {
  var self = this;
  if (self.listener) {
    self.listener.emit('qrcodes', self);
  }
}







drone.prototype.open = function() {
  this.error = null;

  if (this.listener)  	{
    this.error = "Dron is busy";
    return null;
  }

  this.listener = new events.EventEmitter();
  return this.listener
}


drone.prototype.close = function() {
  if (!this.listener)  	{
    this.error = "Not ready";
    return false;
  }

  this.listener.removeAllListeners();
  this.listener = null;
  return true;
}


drone.prototype.ready = function () {
  var self = this;

//  console.log("ready");

  self.pushReady();

  self.client.on('navdata', function(_navdata) {
//    console.log('navdata');
    self.updateState(_navdata);
    self.pushState();
  });

  console.log(selt.client._png);
  self.stream = self.client.createPngStream();
  console.log('png');
//  self.stream.on('data', function(_image) {
////    console.log('png');
//
//    rqcodes. (_image, function (_text,_error) {
//      if (_text) {
//        self.updateQrcode(_text);
//        self.pushQrcode();
//      }
//    });
//
//    self.updateImage(_image);
//    self.pushImage();
//  });
}


drone.prototype.takeoff = function (_callback) {
  var self = this;
//  console.log('take off');
  self.client.takeoff(_callback);
}

drone.prototype.stop = function () {
  var self = this;
  self.client.stop();
}


drone.prototype.land = function () {
  var self = this;
  self.client.land();
}

drone.prototype.move = function (_commands) {
  var self = this;
  console.log('move: ' + _commands)
  if ('forwardbackward' in _commands) {
    if (_commands['forwardbackward'] > 0) {
      self.client.front(_commands['forwardbackward']);
    } else {
      self.client.back(_commands['forwardbackward']);
    }
  }
  if ('leftright' in _commands) {
    if (_commands['leftright'] > 0) {
      self.client.right(_commands['leftright']);
    } else {
      self.client.left(_commands['leftright']);
    }
  }
  if ('updown' in _commands) {
    if (_commands['updown'] > 0) {
      self.client.up(_commands['updown']);
    } else {
      self.client.down(_commands['updown']);
    }
  }
  if ('rotate' in _commands) {
    if (_commands['rotate'] > 0) {
      self.client.clockwise(_commands['rotate']);
    } else {
      self.client.counterClockwise(_commands['rotate']);
    }
  }
}





drone.instance =null;
drone.error = null;



drone.get = function() {
  drone.error = null;
  if (!drone.instance)	{
    try {
      var client = droneApi.createClient();
      client.config('general:navdata_demo', 'FALSE');
      client.config('video:video_channel',  3);
      drone.instance = new drone(client);
      drone.instance.open();
      drone.instance.ready();
    } catch (e) {
      drone.error = e.message;
    }
  }
  return drone.instance;
}

exports.drone = drone;
