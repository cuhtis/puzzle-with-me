var mongoose = require('mongoose');

var Player = new mongoose.Schema({
  username: String
});

mongoose.model('Player', Player);

mongoose.connect('mongodb://curtis:curtis@ds051334.mongolab.com:51334/heroku_7mb729v5/puzzledb');
