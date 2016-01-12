var Cell = require('../config/models/cell.js');
var User = require('../config/models/user.js');

var fillUpByEntrance = function(r, c, result, entrance) {
  if(entrance == 0 || entrance == 2) // west and east
  {
    var select = 1 + Math.random() * (r-3);
    select = Math.ceil(select);
    if(entrance == 2)
    {
      while(result[select][1] == "b") {
        select = 1 + Math.random() * (r-3);
        select = Math.ceil(select);
      }
      result[select][0] = "W";
    } else if(entrance  == 0)
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
    if(entrance == 3)
    {
      while(result[r-2][select] == "b") {
        select = 1 + Math.random() * (c-3);
        select = Math.ceil(select);
      }
      result[r-1][select] = "S";
    }else if(entrance == 1)
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
  var output = {};
  var potionRandom = Math.random();
  var potionMax = 0;
  if(potionRandom < 0.25) {
    potionMax = 1 
  } else if(potionRandom < 0.5) {
    potionMax = 0
  }
  for(var i=0; i<=potionMax; i++) {
    var valueRandom = Math.random();
    if(valueRandom < 0.1) {
      output[i.toString()] = {value: 100, items:1};
    } else if(valueRandom < 0.3) {
      output[i.toString()] = {value: 50, items:1};
    } else {
      output[i.toString()] = {value: 10, items:1};
    }
  }
  var weaponRandom = Math.random();
  var weaponMax = 0;
  if(weaponRandom < 0.10) {
    weaponMax = 1;
  }
  for(var i=0; i<weaponMax; i++) {
    var valueRandom = Math.random();
    if(valueRandom < 0.01) {
      output["2"] = {value: 1000, items:1};
    } else if(valueRandom < 0.1) {
      output["2"] = {value: 50, items:1};
    } else if(valueRandom < 0.5) {
      output["2"] = {value: 10, items:1};
    } else {
      output["2"] = {value: 5, items:1};
    }
  }
  var playerMax = 1;
  var potionIter = 0;
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
        if(blockRandom < 0.1 && weaponMax > 0) {
          result[y][x] = "2";
          weaponMax -= 1;
        } else if(blockRandom < 0.1 && potionIter <= potionMax) {
          if(potionIter == 0) {
            result[y][x] = "0";
          } else {
            result[y][x] = "1"; 
          }
          potionIter += 1;
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
  output["map"] = result.toString();
  output["mapOriginal"] = result;
  return output;
}

module.exports = function(app) {
  app.post('/login', function(req, res){
    var data = req.body;
    User.findOne({username: data.username}, function(err, user){
      if(!user) {
        // first visit
        var resJson = {};
        var output = randomMapGenerator(16,16,-1);
        var newCell = new Cell();
        newCell.hash = newCell.generateHash();
        newCell.map = output["map"];
        newCell.mapOriginal = output["mapOriginal"];
        newCell.markModified("mapOriginal");
        newCell.row = 16;
        newCell.column = 16;
        resJson["map"] = newCell.map;
        resJson["hash"] = newCell.hash;
        resJson["row"] = 16;
        resJson["column"] = 16;
        if(output["0"]) {
          newCell.potion1.value = output["0"].value;
          newCell.potion1.items = output["0"].items;

          resJson["0"] = {"value": newCell.potion1.value, "items": newCell.potion1.items};
        }
        if(output["1"]) {
          newCell.potion2.value = output["1"].value;
          newCell.potion2.items = output["1"].items;

          resJson["1"] = {"value": newCell.potion2.value, "items": newCell.potion2.items};
        }
        if(output["2"]) {
          newCell.weapon.value = output["2"].value;
          newCell.weapon.items = output["2"].items;

          resJson["2"] = {"value": newCell.weapon.value, "items": newCell.weapon.items};
        }
        newCell.save(function(err){
          var newUser = new User();
          newUser.username = data.username;
          newUser.hp = 100;
          newUser.ap = 5;
          newUser.currentCell = {position: "0,0", hash:newCell.hash};
          newUser.cells = {"0,0": newCell.hash};
          resJson["hp"] = newUser.hp;
          resJson["ap"] = newUser.ap;
          newUser.save(function(err){
            res.json(resJson);
          });
        });
         
      } else {
        Cell.findOne({hash: user.currentCell.hash}, function(err, cell){
          var resJson = {};
          resJson["map"] = cell.map;
          resJson["hash"] = cell.hash;
          resJson["row"] = 16;
          resJson["column"] = 16;
          if(cell.potion1.value) {
            resJson["0"] = {"value": cell.potion1.value, "items": cell.potion1.items};
          }
          if(cell.potion2.value) {
            resJson["1"] = {"value": cell.potion2.value, "items": cell.potion2.items};
          }
          if(cell.weapon.value) {
            resJson["2"] = {"value": cell.weapon.value, "items": cell.weapon.items};
          }
          resJson['hp'] = user.hp;
          resJson['ap'] = user.ap;
          res.json(resJson);
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
          var resJson = {};
          var output = randomMapGenerator(16, 16, entrance);
          var newCell = new Cell();
          newCell.hash = newCell.generateHash();
          newCell.map = output["map"];
          newCell.mapOriginal = output["mapOriginal"];
          newCell.markModified("mapOriginal");
          newCell.row = 16;
          newCell.column = 16;
          resJson["map"] = newCell.map;
          resJson["hash"] = newCell.hash;
          resJson["row"] = 16;
          resJson["column"] = 16;
          if(output["0"]) {
            newCell.potion1.value = output["0"].value;
            newCell.potion1.items = output["0"].items;

            resJson["0"] = {"value": newCell.potion1.value, "items": newCell.potion1.items};
          }
          if(output["1"]) {
            newCell.potion2.value = output["1"].value;
            newCell.potion2.items = output["1"].items;

            resJson["1"] = {"value": newCell.potion2.value, "items": newCell.potion2.items};
          }
          if(output["2"]) {
            newCell.weapon.value = output["2"].value;
            newCell.weapon.items = output["2"].items;

            resJson["2"] = {"value": newCell.weapon.value, "items": newCell.weapon.items};
          }

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
                    res.json(resJson);
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
              var resJson = {};
              resJson["map"] = newCell.map;
              resJson["hash"] = newCell.hash;
              resJson["row"] = 16;
              resJson["column"] = 16;
              if( newCell.potion1.value ) {
                resJson["0"] = {"value": newCell.potion1.value, "items": newCell.potion1.items};
              } 
              if( newCell.potion2.value ) {
                resJson["1"] = {"value": newCell.potion2.value, "items": newCell.potion2.items};
              } 
              if( newCell.weapon.value ) {
                resJson["2"] = {"value": newCell.weapon.value, "items": newCell.weapon.items};
              }             
              var pos = user.currentCell.position;
              var s = pos.split(",");
              var newPos = (parseInt(s[0]) + dirX).toString() + "," + (parseInt(s[1]) + dirY).toString();
              user.currentCell.position = newPos;
              user.currentCell.hash = newCell.hash;
              user.cells[newPos] = newCell.hash;
              user.markModified('cells');
              user.save(function(err){
                res.json(resJson);
              });    
            });
          });
        }
      });
    } else {
      var output = randomMapGenerator(16, 16, entrance);
      var resJson = {};
      var newCell = new Cell();
      newCell.hash = newCell.generateHash();
      newCell.map = output["map"];
      newCell.mapOriginal = output["mapOriginal"];
      newCell.markModified("mapOriginal");
      newCell.row = 16;
      newCell.column = 16;
      resJson["map"] = newCell.map;
      resJson["hash"] = newCell.hash;
      resJson["row"] = 16;
      resJson["column"] = 16;
      if(output["0"]) {
        newCell.potion1.value = output["0"].value;
        newCell.potion1.items = output["0"].items;

        resJson["0"] = {"value": newCell.potion1.value, "items": newCell.potion1.items};
      }
      if(output["1"]) {
        newCell.potion2.value = output["1"].value;
        newCell.potion2.items = output["1"].items;

        resJson["1"] = {"value": newCell.potion2.value, "items": newCell.potion2.items};
      }
      if(output["2"]) {
        newCell.weapon.value = output["2"].value;
        newCell.weapon.items = output["2"].items;

        resJson["2"] = {"value": newCell.weapon.value, "items": newCell.weapon.items};
      }

      newCell.save(function(err){
        res.json(resJson);
      });
    }
  });
}
