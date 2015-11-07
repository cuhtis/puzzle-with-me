var mongoose = require('mongoose');

var Session = new mongoose.Schema({
  session_id: String,
  host: String,
  num_players: Number,
  players: Array,
  games: Array,
  bet_pot: Number
});

mongoose.model('Session', Session);

mongoose.connect('mongodb://curtis:curtis@ds051334.mongolab.com:51334/heroku_7mb729v5/puzzledb');
