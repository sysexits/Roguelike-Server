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
  app.post('/randomMapGenerator', function(req,res) {
    var data = req.body;
    var entrance = -1; // 0 - West, 1 - South, 2 - East, 3 - North
    if('entrance' in data)
      entrance = data.entrance
    var str = randomMapGenerator(16, 16, entrance);
    res.json({"map": str, "row": 16, "column": 16});
  });
}
