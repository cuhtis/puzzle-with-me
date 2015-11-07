var mongoose = require('mongoose');

var Player = new mongoose.Schema({
  username: String,
  isHost: Boolean,
  paid: Boolean,
  betAmt: Number,
  isReady: Boolean
});

mongoose.model('Player', Player);
