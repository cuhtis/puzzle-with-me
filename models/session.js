var mongoose = require('mongoose');

var Session = new mongoose.Schema({
  session_id: String,
  host: String,
  num_players: Number,
  players: Array,
  games: Array,
  bet_pot: Number,
  active: Boolean,
  num_ready: Number,
  allReady: Boolean
});

mongoose.model('Session', Session);
