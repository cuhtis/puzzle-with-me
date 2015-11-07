var mongoose = require('mongoose');

var Player = new mongoose.Schema({
  username: String
});

mongoose.model('Player', Player);
