var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Stomp = require('stompjs');

var app = express();
var port = process.argv[2] || 8000;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({secret: '651de52f36ae3a7d02a6808928b8b756', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

var server = app.listen(port, function(err) {
  if(err) throw err;
  var host = server.address().address;
  console.log("Backend listening at http://%s:%s", host, port);
});
