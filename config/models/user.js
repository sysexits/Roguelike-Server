var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var userSchema = new Schema({
  username: String,
  hp: Number,
  ap: Number,
  currentCell: {position: String, hash: String},
  cells: Schema.Types.Mixed
}, {collection: 'roguelike_user_test'});

module.exports = mongoose.model('User', userSchema);
