const dgram = require('dgram');
var mongoose = require('mongoose');
const server = dgram.createSocket('udp4');

var database = require('./config/database.js');

mongoose.connect(database.url);

var Cell = require('./config/models/cell.js');
var User = require('./config/models/user.js');

server.on('error', (err)=> {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    var data = JSON.parse(msg.toString());
    if(data.action === "consume") {
      Cell.findOne({hash: data.hash}, function(err, cell) {
        User.findOne({username: data.username}, function(err, user){
          if(data.consume === "0") {
            cell.potion1.items = 0;
            if(user.hp + cell.potion.value > 100) {
              user.hp = 100;
            } else {
              user.hp += cell.potion.value;
            }
          } else if(data.consume === "1") {
            cell.potion2.items = 0;
            if(user.hp + cell.potion.value > 100) {
              user.hp = 100;
            } else {
              user.hp += cell.potion.value;
            }
          } else if(data.consume === "2") {
            cell.weapon.items = 0;
            user.ap = cell.weapon.value;
          }
          cell.save(function(err){
            user.save(function(err){
            });
          });
        });
      });  
    }
});

server.on('listening', () => {
    var address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);

});

server.bind(41234);
