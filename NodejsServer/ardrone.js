var http          = require('http'),
    express       = require('express'),
    app = express();

// Configuration
app.configure(function(){
  app.use(express.bodyParser());
//  app.use(express.methodOverride());
//  app.use(app.router);
  app.use(express.static('./project/NodejsServer/static'));
});

var oCurrentState = {};

app.get('/', function(request, response){
  response.send('hello world');
});

// Sends drone state & image
app.get('/dron/events', function(request, response){
  var droneClient  = require('ar-drone').createClient({'ip':'127.0.0.1'});

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
      oCurrentState.readystate = navdata.droneState.flying == 1 ? 'flying' : 'landed';
      response.write('data:' + JSON.stringify(oCurrentState) +   '\n\n');
    }
  });

  // Create PNG stream and subscribe for it's data
  var pngStream = droneClient.createPngStream();
  pngStream.on('data', function(pngImage) {
    oCurrentState.img = new Buffer(pngImage, 'binary').toString('base64');
    response.write('data:' + JSON.stringify(oCurrentState) +   '\n\n');
  });
});

// Take the dron off
app.post('/dron/takeoff', function(request, response) {
  var droneClient  = require('ar-drone').createClient({'ip':'127.0.0.1'});
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
  var droneClient  = require('ar-drone').createClient({'ip':'127.0.0.1'});
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
    var droneClient  = require('ar-drone').createClient({'ip':'127.0.0.1'});
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
