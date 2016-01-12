const dgram = require('dgram');
var mongoose = require('mongoose');
const server = dgram.createSocket('udp4');

var database = require('./config/database.js');

mongoose.connect(database.url);

var Cell = require('./config/models/cell.js');
var User = require('./config/models/user.js');

Array.prototype.remove = function() {
      var what, a = arguments, L = a.length, ax;
      while (L && this.length) {
          what = a[--L];
          while ((ax = this.indexOf(what)) !== -1) {
              this.splice(ax, 1);                        
          }   
      }
      return this;
};

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
            if(user.hp + cell.potion1.value > 100) {
              user.hp = 100;
            } else {
              user.hp += cell.potion1.value;
            }
          } else if(data.consume === "1") {
            cell.potion2.items = 0;
            if(user.hp + cell.potion2.value > 100) {
              user.hp = 100;
            } else {
              user.hp += cell.potion2.value;
            }
          } else if(data.consume === "2") {
            cell.weapon.items = 0;
            user.ap = cell.weapon.value;
          }
          user.save(function(err){
          });
          cell.save(function(err){
          });
        });
      });  
    } else if(data.action === "exit") {
      Cell.findOne({hash: data.hash}, function(err, cell){
        cell.ips.remove(data.ip);
        cell.save(function(err){
        });
      }); 
    } else if(data.action == "move") {
      Cell.findOne({hash: data.hash}, function(err, cell){
        var jsonObject = JSON.parse(cell.moves);
        jsonObject[data.ip] = {xpos: data.xpos, ypos: data.ypos, username: data.username};
        cell.moves = JSON.stringify(jsonObject);
        cell.save(function(err){
          
        });
      }); 
    }
});

server.on('listening', () => {
    var address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);

});

server.bind(41234);
