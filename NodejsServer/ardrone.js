var http          = require('http'),
    express       = require('express'),
    qrcode        = require('./qrcode'),
    app = express();

var _DRONE_IP_ADDRESS = '192.168.1.1';

// Configuration
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.static('./project/HTML5Application/public_html'));
});

var oCurrentState = {
  'drone' : null,
  'getDrone' : function() {
    if (!this.drone) {
      try {
        var droneClient = require('ar-drone').createClient();
        droneClient.config('general:navdata_demo', 'FALSE');
        this.drone = droneClient;
      } catch(e) {}
    }
    return this.dron;
  },
  'qrcodes' : [],
  'recognitionStatus' : 0
};

// Sends drone state & image
app.get('/dron/events', function(request, response){
  var droneClient = oCurrentState.getDrone();
  if (!droneClient) {
    response.writeHead(503, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    response.write('\n0');
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
    droneClient.stop();
    response.end();
  });

  // Subscribe to recieve telemetrics
  droneClient.on('navdata', function(navdata) {
    if (navdata.droneState && navdata.demo) {
      var bStateChanged = oCurrentState.droneState != navdata.droneState;
      oCurrentState.droneState  = navdata.droneState;
      oCurrentState.droneDemo   = navdata.demo;
      // Sends update to client only if drone state has been changed
      if (bStateChanged) {
        response.write('data:' + JSON.stringify({
          'readystate'  : oCurrentState.droneState.flying == 1 ? 'flying' : 'landed',
          'img'         : oCurrentState.img
        }) +   '\n\n');
      }
    }
  });

  // Create PNG stream and subscribe for it's data
  var pngStream = droneClient.createPngStream();
  pngStream.on('data', function(pngImage) {
    var img = 'data:image/png;base64,' + (new Buffer(pngImage, 'binary').toString('base64'));
    if (img != oCurrentState.img) {
      oCurrentState.img = img;
      response.write('data:' + JSON.stringify({
        'readystate'  : oCurrentState.droneState.flying == 1 ? 'flying' : 'landed',
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
});

// Take the dron off
app.post('/dron/takeoff', function(request, response) {
  var droneClient = oCurrentState.getDrone();
  if (!droneClient) {
    response.writeHead(503, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    response.write('\n0');
    return;
  }
  droneClient.takeoff();
  response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
    'Connection': 'close'
  });
  response.write('\n1');
});

// Makes the drom land
app.post('/dron/land', function(request, response) {
  var droneClient = oCurrentState.getDrone();
  if (!droneClient) {
    response.writeHead(503, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    response.write('\n0');
    return;
  }
  droneClient.land();
  response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
    'Connection': 'close'
  });
  response.write('\n1');
});

// Makes the dron move
app.post('/dron/move', function(request, response) {
  if (request.body.command && !isNaN(request.body.value)) {
    var droneClient = oCurrentState.getDrone();
    if (!droneClient) {
      response.writeHead(503, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'close'
      });
      response.write('\n0');
      return;
    }
    if (request.body.command == 'forwardbackward') {
      if (request.body.value > 0) {
        droneClient.front(request.body.value);
      } else {
        droneClient.back(request.body.value);
      }
    } else if (request.body.command == 'leftright') {
      if (request.body.value > 0) {
        droneClient.right(request.body.value);
      } else {
        droneClient.left(request.body.value);
      }
    } else if (request.body.command == 'updown') {
      if (request.body.value > 0) {
        droneClient.up(request.body.value);
      } else {
        droneClient.down(request.body.value);
      }
    } else if (request.body.command == 'rotate') {
      if (request.body.value > 0) {
        droneClient.clockwise(request.body.value);
      } else {
        droneClient.counterClockwise(request.body.value)
      }
    }
    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    response.write('\n1');
  } else {
    response.write('\n0');
  }
});

// Sends drone's full state
app.get('/dron/state', function(request, response){
  var droneClient = oCurrentState.getDrone();
  if (!droneClient) {
    response.writeHead(503, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'close'
    });
    response.write('\n0');
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

app.listen(1337, '127.0.0.1');
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
