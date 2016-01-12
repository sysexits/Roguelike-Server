var port = 12345;
var host = '143.248.232.40';

var dgram = require('dgram');
var data = {};
data.action = "myinfo";
data.username = "test";
data.xpos = "1";
data.ypos = "2"
var message = new Buffer(JSON.stringify(data));

var client = dgram.createSocket('udp4');
client.send(message, 0, message.length, port, host, function(err, bytes){
  if(err) throw err;
  console.log('UDP sent to ' + host + ':' + port);
  client.close();
});
