var mongoose = require('mongoose');

var Puzzle = new mongoose.Schema({
  qid: Number,
  question: String,
  answer: String,
  answers: Array
});

mongoose.model('Puzzle', Puzzle);