var http    = require('http'),
    express = require('express'),
    qrcode  = require('./qrcode'),
    drone   = require('./drone').drone,
    app = express();
var _DRONE_IP_ADDRESS = '192.168.1.1';

// Configuration
app.configure(function(){
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.static('./project/HTML5Application/public_html'));
});

var oCurrentState = {
  'qrcodes' : [],
  'recognitionStatus' : 0
};

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

function sendState(_stream, _drone) {
  _stream.write('data:' + JSON.stringify({
    'readystate'  : _drone.navdata ? _drone.navdata.droneState.flying == 1 ? 'flying' : 'landed' : 'uninited',
    'img' : _drone.lastImage && 'data:image/png;base64,' + _drone.lastImage.toString('base64')
  }) +   '\n\n');
}

// Sends drone state & image
app.get('/dron/events', function(request, response){
  var droneClient = getDrone(response, true);
  if (!droneClient) {
    sendState(response, {'lastImage':''});
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
  request.on("close", function() {
    var droneClient = getDrone(response);
    if (droneClient) {
      droneClient.stop();
    }
    response.end();
  });

  var prevState = null;
  droneClient.listener.on('state', function(_DroneObject) {
    if (_DroneObject.navdata.droneState) {
      if (prevState != _DroneObject.navdata.droneState.flying) {
        sendState(response, _DroneObject);
      }
      prevState = _DroneObject.navdata.droneState.flying
    }
  });

  droneClient.listener.on('image', function(_DroneObject) {
    sendState(response, _DroneObject);
  });


  // Subscribe to recieve telemetrics
//  droneClient.on('navdata', function(navdata) {
//    if (navdata.droneState && navdata.demo) {
//      var bStateChanged = oCurrentState.droneState != navdata.droneState;
//      oCurrentState.droneState  = navdata.droneState;
//      oCurrentState.droneDemo   = navdata.demo;
//      // Sends update to client only if drone state has been changed
//      if (bStateChanged) {
//        response.write('data:' + JSON.stringify({
//          'readystate'  : oCurrentState.droneState ? oCurrentState.droneState.flying == 1 ? 'flying' : 'landed' : 'uninited',
//          'img'         : oCurrentState.img
//        }) +   '\n\n');
//      }
//    }
//  });

  // Create PNG stream and subscribe for it's data
/*
  var pngStream = droneClient.createPngStream();
  pngStream.on('data', function(pngImage) {
    console.log('ondata');
    var img = 'data:image/png;base64,' + (new Buffer(pngImage, 'binary').toString('base64'));
    if (img != oCurrentState.img) {
      oCurrentState.img = img;
      response.write('data:' + JSON.stringify({
        'readystate'  : oCurrentState.droneState ? oCurrentState.droneState.flying == 1 ? 'flying' : 'landed' : 'uninited',
        'img'         : oCurrentState.img
      }) +   '\n\n');
      if (!oCurrentState.recognitionStatus) {
        oCurrentState.recognitionStatus = 1;
        qrcode.recognize(img, function(sText){
          oCurrentState.recognitionStatus = 0;
          if (sText) {
            oCurrentState.qrcodes.push(sText);
          }
        });
      }
    }
  });
*/
});

// Take the dron off
function onTakeoff (request, response) {
  var droneClient = getDrone(response);
  if (!droneClient) {
    return;
  }
  droneClient.takeoff(function(){
    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    response.write('\n1');
    response.end();
  });
}
app.get('/dron/takeoff', onTakeoff);
app.post('/dron/takeoff', onTakeoff);

// Makes the drom land
function onLand (request, response) {
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
app.get('/dron/land', onLand);
app.post('/dron/land', onLand);

// Makes the dron move
app.post('/dron/move', function(request, response) {
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
});

// Sends drone's full state
app.get('/dron/state', function(request, response){
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

  // Push telemetrics data via interval
  var intervalId = setInterval(function() {
    response.write('data:' + JSON.stringify({
      'readystate'  : oCurrentState.droneState ? oCurrentState.droneState.flying == 1 ? 'flying' : 'landed' : 'unknown',
      'data'        : oCurrentState.droneDemo,
      'qrcodes'     : oCurrentState.qrcodes
    }) +   '\n\n');  }, 100);

  // Handle connection interrupt
  request.on("close", function() {
    clearInterval(intervalId);
    response.end();
  });
});

app.listen(1337, '0.0.0.0');
console.log('Server running at http://127.0.0.1:1337/');

/*
response.writeHead(200, {'Content-Type': 'text/plain'});
//  var qrdecoder = require('node-zxing')({'ZXingLocation':'./node_modules/node-zxing/lib/'});
//  var path = "./sample.jpg";
//  qrdecoder.decode(path,
//      function(err, out) {
//        res.end(out + '\n');
//        console.log(err,out);
//      }
//  );

var client  = require('ar-drone').createClient({'ip':'127.0.0.1'});
client.up(0.5);
//  client.front(1);
*/
