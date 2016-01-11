var Cell = require('../config/models/cell.js');
var User = require('../config/models/user.js');

var fillUpByEntrance = function(r, c, result, entrance) {
  if(entrance == 0 || entrance == 2) // west and east
  {
    var select = 1 + Math.random() * (r-3);
    select = Math.ceil(select);
    if(entrance == 0)
    {
      while(result[select][1] == "b") {
        select = 1 + Math.random() * (r-3);
        select = Math.ceil(select);
      }
      result[select][0] = "W";
    } else if(entrance  == 2)
    {
      while(result[select][c-2] == "b") {
        select = 1 + Math.random() * (r-3);
        select = Math.ceil(select);
      }
      result[select][c-1] = "E";
    }
  }else if(entrance == 1 || entrance == 3) // south and north
  {
    var select = 1 + Math.random() * (c-3);
    select = Math.ceil(select);
    if(entrance == 1)
    {
      while(result[r-2][select] == "b") {
        select = 1 + Math.random() * (c-3);
        select = Math.ceil(select);
      }
      result[r-1][select] = "S";
    }else if(entrance == 3)
    {
      while(result[1][select] == "b") {
        select = 1 + Math.random() * (c-3);
        select = Math.ceil(select);
      }
      result[0][select] = "N";
    }
  }
}

var randomMapGenerator = function(r,c,e) {
  var potionRandom = Math.random();
  var potionMax = 0;
  if(potionRandom < 0.25) {
    potionMax = 2
  } else if(potionRandom < 0.5) {
    potionMax = 1
  }
  var weaponRandom = Math.random();
  var weaponMax = 0;
  if(weaponRandom < 0.10) {
    weaponMax = 1;
  }
  var playerMax = 1;
  var result = new Array(r);
  for(var y=0; y<r; y++) {
    result[y] = new Array(c);
    for(var x=0; x<c; x++) {
      if(y == 0 || y == r-1 || x == 0 || x == c-1)
      {
        result[y][x] = "#";
      }
      else
      {
        blockRandom = Math.random();
        if(blockRandom < 0.15 && weaponMax > 0) {
          result[y][x] = "w";
          weaponMax -= 1;
        } else if(blockRandom < 0.18 && potionMax > 0) {
          result[y][x] = "p";
          potionMax -= 1;
        } else if(blockRandom < 0.1) {
          result[y][x] = "b";
        } else if(e == -1 && playerMax > 0 ) {
          result[y][x] = "u";
          playerMax -= 1;
        } else {
          result[y][x] = "f";
        }
      }
    }
  }
  var entrances = [0,1,2,3];
  if(e > -1) {
    entrances.splice(e,1);
    fillUpByEntrance(r, c, result, e);
  }
  var entranceRandom = Math.random();
  var entranceMax = 3 * Math.random();
  entranceMax = Math.ceil(entranceMax);
  while(entranceMax > 0) {
    var seed = Math.random() * (entrances.length-1);
    seed = Math.ceil(seed);
    entrance = entrances[seed];
    entrances.splice(seed,1);
    entranceMax -= 1;
    fillUpByEntrance(r, c, result, entrance);
  }
  return result.toString()
}

module.exports = function(app) {
  app.post('/login', function(req, res){
    var data = req.body;
    User.findOne({username: data.username}, function(err, user){
      if(!user) {
        // first visit
        var str = randomMapGenerator(16,16,-1);
        var newCell = new Cell();
        newCell.hash = newCell.generateHash();
        newCell.map = str;
        newCell.row = 16;
        newCell.column = 16;
        newCell.save(function(err){
          var newUser = new User();
          newUser.username = data.username;
          newUser.currentCell = {position: "0,0", hash:newCell.hash};
          newUser.cells = {"0,0": newCell.hash};
          newUser.save(function(err){
            res.json({'status': 200, 'hash': newCell.hash, 'map': newCell.map, 'row': 16, 'column': 16});
          });
        });
         
      } else {
        Cell.findOne({hash: user.currentCell.hash}, function(err, cell){
          res.json({'status': 200, 'hash': cell.hash, 'map': cell.map, 'row': 16, 'column': 16});
        });
      }
    });
  });
  app.post('/randomMapGenerator', function(req,res) {
    var data = req.body;
    var entrance = -1; // 0 - West, 1 - South, 2 - East, 3 - North
    if('entrance' in data)
      entrance = data.entrance
    if('hash' in data) {
      var query = {hash: data.hash};
      if(entrance == 0) {
        query.W = {$exists: true};
      } else if(entrance == 1) {
        query.S = {$exists: true};
      } else if(entrance == 2) {
        query.E = {$exists: true};
      } else if(entrance == 3) {
        query.N = {$exists: true};
      }
      Cell.findOne(query, function(err, cell){
        if(!cell) {
          // cell is not exists
          var str = randomMapGenerator(16, 16, entrance);
          var newCell = new Cell();
          newCell.hash = newCell.generateHash();
          newCell.map = str;
          newCell.row = 16;
          newCell.column = 16;
          Cell.findOne( {'hash': data.hash}, function(err, cell){
            var dirX = 0; var dirY = 0;
            if(entrance == 0) {
              cell.W = newCell.hash;
              newCell.E = data.hash;
              dirX = -1;
            } else if(entrance == 1) {
              cell.S = newCell.hash;
              newCell.N = data.hash;
              dirY = 1;
            } else if(entrance == 2) {
              cell.E = newCell.hash;
              newCell.W = data.hash;
              dirX = 1;
            } else if(entrance == 3) {
              cell.N = newCell.hash;
              newCell.S = data.hash;
              dirY = -1;
            }
            User.findOne({'username': data.username}, function(err,user){
              var pos = user.currentCell.position;
              var s = pos.split(",");
              var newPos = (parseInt(s[0]) + dirX).toString() + "," + (parseInt(s[1]) + dirY).toString();
              user.currentCell.position = newPos;
              user.currentCell.hash = newCell.hash;
              user.cells[newPos] = newCell.hash;
              user.markModified('cells');
              cell.save(function(err){
                newCell.save(function(err){
                  user.save(function(err){
                    res.json({'status': 200, 'hash': newCell.hash, 'map': str, 'row': 16, 'column': 16});
                  });
                });
              });
            });
          });
        } else {
          var newQuery = {};
          var dirX = 0; var dirY = 0;
          if(entrance == 0) {
            newQuery.hash = cell.W;
            dirX = -1;
          } else if(entrance == 1) {
            newQuery.hash = cell.S;
            dirY = 1;
          } else if(entrance == 2) {
            newQuery.hash = cell.E;
            dirX = 1;
          } else if(entrance == 3) {
            newQuery.hash = cell.N;
            dirY = -1;
          }
          Cell.findOne(newQuery, function(err, newCell){
            User.findOne({'username': data.username}, function(err, user){
              var pos = user.currentCell.position;
              var s = pos.split(",");
              var newPos = (parseInt(s[0]) + dirX).toString() + "," + (parseInt(s[1]) + dirY).toString();
              user.currentCell.position = newPos;
              user.currentCell.hash = newCell.hash;
              user.cells[newPos] = newCell.hash;
              user.markModified('cells');
              user.save(function(err){
                res.json({'status': 200, hash: newCell.hash, map: newCell.map, row: newCell.row, column: newCell.column})
              });    
            });
          });
        }
      });
    } else {
      var str = randomMapGenerator(16, 16, entrance);
      var newCell = new Cell();
      newCell.hash = newCell.generateHash();
      newCell.map = str;
      newCell.row = 16;
      newCell.column = 16;
      newCell.save(function(err){
        res.json({'status': 200, 'hash': newCell.hash, 'map': str, 'row': 16, 'column': 16});
      });
    }
  });
}
