var http = require('http'),
    express = require('express'),
    qrcode = require('./qrcode'),
    drone = require(!process.env["drone_fake"] ? './drone' : './fakedrone').drone,
    app = express();


drone.options = {
  'general:navdata_demo': 'FALSE',
  'video:video_channel': parseInt(process.env["drone_video_channel"]) || null
};

drone.features = {
  'motion-filter': process.env["drone_motion_filter"] ? true : false,
  'motion-smooth': process.env["drone_motion_smooth"] ? true : false,
  'motion-smooth-factor': parseInt(process.env["drone_motion_smooth_factor"]) || 10
};


// Configuration
app.configure(function () {
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.static('./project/HTML5Application/public_html'));
});


function getDrone(_stream) {
  var droneClient = drone.get();
  if (!droneClient) {
    _stream.writeHead(503, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    _stream.write('\n0');
    _stream.end();
    return null;
  }
  return droneClient;
}

function sendEvent(_stream, _drone) {
  _stream.write('data:' + JSON.stringify({
    'readystate': (_drone.navdata && _drone.navdata.droneState ) ? _drone.navdata.droneState.flying == 1 ? 'flying' : 'landed' : 'uninited',
    'img': _drone.lastImage && 'data:image/png;base64,' + _drone.lastImage.toString('base64')
  }) + '\n\n');
}


function sendState(_stream, _drone) {
  _stream.write('data:' + JSON.stringify({
    'readystate': (_drone.navdata && _drone.navdata.droneState) ? _drone.navdata.droneState.flying == 1 ? 'flying' : 'landed' : 'uninited',
    'demo': _drone.navdata && _drone.navdata.demo,
    'qrcodes': _drone.qrcodes || []
  }) + '\n\n');
}


// Sends drone state & image
function onEvents(request, response) {
  var droneClient = getDrone(response);
  if (!droneClient) {
    return;
  }
  // Push data through socket
  request.socket.setTimeout(Infinity);
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  response.write('\n');

  // Handle connection interrupt
  request.on("close", function () {
    var droneClient = getDrone(response);
    if (droneClient) {
      droneClient.stop();
    }
    response.end();
  });

  var prevState = null;
  droneClient.listener.on('state', function (_DroneObject) {
    if (_DroneObject.navdata.droneState) {
      if (prevState != _DroneObject.navdata.droneState.flying) {
        sendEvent(response, _DroneObject);
      }
      prevState = _DroneObject.navdata.droneState.flying;
    }
  });

  droneClient.listener.on('image', function (_DroneObject) {
    sendEvent(response, _DroneObject);
  });
}


function onState(request, response) {
  var droneClient = getDrone(response);
  if (!droneClient) {
    return;
  }
  // Push data through socket
  request.socket.setTimeout(Infinity);
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  response.write('\n');

  // Handle connection interrupt
  request.on("close", function () {
    var droneClient = getDrone(response);
    if (droneClient) {
      droneClient.stop();
    }
    response.end();
  });

  droneClient.listener.on('state', function (_DroneObject) {
    sendState(response, _DroneObject);
  });

  droneClient.listener.on('qrcodes', function (_DroneObject) {
    sendState(response, _DroneObject);
  });
}


// Take the dron off
function onTakeoff(request, response) {
  var droneClient = getDrone(response);
  if (!droneClient) {
    return;
  }
  droneClient.takeoff(function () {
    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    response.write('\n1');
    response.end();
  });
}


// Makes the drom land
function onLand(request, response) {
  var droneClient = getDrone(response);
  if (!droneClient) {
    return;
  }
  droneClient.land();
  response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
    'Connection': 'close'
  });
  response.write('\n1');
  response.end();
}


function onMove(request, response) {
  if (request.body) {
    var droneClient = getDrone(response);
    if (!droneClient) {
      return;
    }
    droneClient.move(request.body);

    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    response.write('\n1');
  } else {
    response.write('\n0');
  }
  response.end();
}


// Sends drone state & image
app.get('/dron/events', onEvents);

// Takeoff drone
app.get('/dron/takeoff', onTakeoff);
app.post('/dron/takeoff', onTakeoff);

// Land drone
app.get('/dron/land', onLand);
app.post('/dron/land', onLand);

// Makes the drone move
app.post('/dron/move', onMove);

// Sends drone's full state
app.get('/dron/state', onState);

app.listen(1337, '0.0.0.0');

console.log('Server running at http://127.0.0.1:1337/');



