var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Session = mongoose.model('Session');
var Player = mongoose.model('Player');

/* GET home page. */
router.get('/', function(req, res, next) { // change ready and unpaid
  res.render('index', { title: 'Puzzle With Me', isHost: true});
});

router.get('/rules', function(req, res, next) {
  res.render('rules');
});

router.get('/result', function(req, res, next) {
  // PSUEDOCODE
  // if (req.session.winner === req.session.id) {
  //   res.render('winner', {pot: game.pot});
  // } else {
  //   res.render('loser', {winner: game.winner, bet: req.session.bet});
  // }
  res.redirect('/');
});

module.exports = router;
