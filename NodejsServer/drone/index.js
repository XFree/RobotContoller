var droneApi = require('ar-drone');
var events = require('events');
var fs = require('fs');
var qr = require('../qrcode');


function drone(_client, _stream) {
  this.name = "drone";
  this.client = _client;
  this.stream = _stream;
  this.listener = new events.EventEmitter();
  this.last_motion = {};

  this.navdata = {};

  this.lastImage = null;
  this.recognizingImages = 0;

  this.qrcodes = [];
  this.error = "";
}


drone.instance = null;
drone.options = {};
drone.features = {};
drone.error = null;


drone.prototype.updateState = function (_navdata) {
  if (_navdata.droneState && _navdata.demo) {
    this.navdata = _navdata;
  }
}


drone.prototype.updateImage = function (_image) {
  var self = this;
  self.lastImage = _image;

  if (self.recognizingImages < 10) {
    ++self.recognizingImages;
    qr.recognize(_image, function (_text, _error) {
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
    if (this.qrcodes[i] === _text) {
      break;
    }
  }
  if (i == n) {
    this.qrcodes.push(_text);
  }
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


drone.prototype.pushImage = function () {
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


drone.prototype.isMotionFiltered = function (_command, _value) {
  if (!drone.features["motion-filter"]) {
    return false;
  }

  if (this.last_motion[_command] !== _value) {
    return false;
  }

  return true;
}


drone.prototype.smoothMotion = function (_value) {
  if (!drone.features["motion-smooth"]) {
    return _value;
  }
  var factor = drone.features["motion-smooth-factor"] || 10;
  if (factor < 5) {
    factor = 5;
  }
  if (factor > 100) {
    factor = 100;
  }
  return Math.round(_value * factor) / factor;
}


drone.prototype.prepare = function () {
  var self = this;

  self.pushReady();

  if (self.client) {
    self.client.on('navdata', function (_navdata) {
      //    console.log('navdata');
      self.updateState(_navdata);
      self.pushState();
    });
  }

  if (self.stream) {
    self.stream.on('error', console.log);
    self.stream.on('data', function (_image) {
      self.updateImage(_image);
      self.pushImage();
    });
  }
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

  var command;

  console.log('move: %j', _commands);

  command = 'forwardbackward';
  if (command in _commands) {
    var value = self.smoothMotion(_commands[command]);
    if (!self.isMotionFiltered(command, value)) {
      if (value >= 0) {
        self.client.front(value);
      } else {
        self.client.back(-value);
      }
      console.log('Motion "%s" sended. Value: %s', command, value);
    } else {
      console.log('Motion "%s" filtered. Value: %s', command, value);
    }
    self.last_motion[command] = value;
  }

  command = 'leftright';
  if (command in _commands) {
    var value = self.smoothMotion(_commands[command]);
    if (!self.isMotionFiltered(command, value)) {
      if (value >= 0) {
        self.client.right(value);
      } else {
        self.client.left(-value);
      }
      console.log('Motion "%s" sended. Value: %s', command, value);
    } else {
      console.log('Motion "%s" filtered. Value: %s', command, value);
    }
    self.last_motion[command] = value;
  }

  command = 'updown';
  if (command in _commands) {
    var value = self.smoothMotion(_commands[command]);
    if (!self.isMotionFiltered(command, value)) {
      if (value >= 0) {
        self.client.up(value);
      } else {
        self.client.down(-value);
      }
      console.log('Motion "%s" sended. Value: %s', command, value);
    } else {
      console.log('Motion "%s" filtered. Value: %s', command, value);
    }
    self.last_motion[command] = value;
  }

  command = 'rotate';
  if (command in _commands) {
    var value = self.smoothMotion(_commands[command]);
    if (!self.isMotionFiltered(command, value)) {
      if (value >= 0) {
        self.client.clockwise(value);
      } else {
        self.client.counterClockwise(-value);
      }
      console.log('Motion "%s" sended. Value: %s', command, value);
    } else {
      console.log('Motion "%s" filtered. Value: %s', command, value);
    }
    self.last_motion[command] = value;
  }
}


drone.get = function () {
  drone.error = null;

  if (!drone.instance) {
    var client, stream;
    try {
      client = droneApi.createClient();
    } catch (e) {
      console.error('Create client: ' + e.message);
      drone.error = e.message;
    }

    if (client && drone.options) {
      for (var k in drone.options) {
        if (drone.options[k]) {
          console.log("Set config: %j: %j", k, drone.options[k])
          client.config(k, drone.options[k]);
        }
      }
    }

    console.log("Features: %j", drone.features);
    try {
      stream = client && client.createPngStream();
    } catch (e) {
      console.error('Create stream: ' + e.message);
      drone.error = e.message;
    }

    drone.instance = client ? new drone(client, stream) : null;
    drone.instance.prepare();
  }
  return drone.instance;
}


exports.drone = drone;
