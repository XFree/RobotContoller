var http          = require('http'),
    express       = require('express'),
    app = express();

// Configuration
app.configure(function(){
//  app.use(express.bodyParser());
//  app.use(express.methodOverride());
//  app.use(app.router);
  app.use(express.static('./project/NodejsServer/static'));
});

var oCurrentState = {};

app.get('/', function(request, response){
  response.send('hello world');
});

app.get('/update-stream', function(request, response) {
  // let request last as long as possible
  request.socket.setTimeout(Infinity);

  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  response.write('\n');

  setInterval(function(){
    console.log(aEvents);
//    response.write('id: ' + Number(new Date() + '\n'));
    response.write('data:' + JSON.stringify(aEvents) +   '\n\n');
//    response.json(aEvents);
  }, 1000);

  // The 'close' event is fired when a user closes their browser window.
  // In that situation we want to make sure our redis channel subscription
  // is properly shut down to prevent memory leaks...and incorrect subscriber
  // counts to the channel.
  request.on("close", function() {
    response.end();
  });
});

app.get('/fire-event/test', function(request, response) {
  var d = String(Number(new Date()));
  aEvents.push(d);
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write(d);
  response.end();
});

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

app.get('/dron/takeoff', function(request, response){
  response.send('hello world');
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
