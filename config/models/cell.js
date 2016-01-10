var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var cellSchema = new Schema({
  hash: String,
  map: String,
  row: Number,
  column: Number,
  N: String,
  W: String,
  S: String,
  E: String,
}, {collection: 'cell_test'});

cellSchema.methods.generateHash = function() {
  return bcrypt.hashSync(Date.now, bcrypt.genSaltSync(8));
}

module.exports = mongoose.model('Cell', cellSchema);
