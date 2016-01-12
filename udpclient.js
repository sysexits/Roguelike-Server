var port = 41234;
var host = '143.248.139.70';

var dgram = require('dgram');
var data = {};
data.hash = "$2a$08$wvb5fEi/sOO.5bG5HAPWjO4K4H.34JW2qhjTa2rqwaTsSOKma.ZI2";
data.action = "consume";
data.consume = "1";
var message = new Buffer(JSON.stringify(data));

var client = dgram.createSocket('udp4');
client.send(message, 0, message.length, port, host, function(err, bytes){
  if(err) throw err;
  console.log('UDP sent to ' + host + ':' + port);
  client.close();
});
