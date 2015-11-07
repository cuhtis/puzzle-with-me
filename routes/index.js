var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Session = mongoose.model('Session');
var Player = mongoose.model('Player');

/* GET home page. */
router.get('/', function(req, res, next) { // change ready and unpaid
  if (req.session.activeSession) {
    Session.findOne({_id: req.session.activeSession}, function(err, session) {
      if (session.host === req.session.username) {
        res.redirect('/game/host/'+req.session.activeSession);
      } else {
        res.redirect('/game/join/'+req.session.activeSession);
      }
    });
  } else {
    res.render('index', { title: 'Puzzle With Me', isHost: true});
  }
});

router.get('/rules', function(req, res, next) {
  res.render('rules', { title: 'Rules' });
});

router.get('/error', function(req, res, next) {
  var errorText = "Unknown error.";
  if (req.query.type === "notfound") errorText = "Session not found.";
  if (req.query.type === "full") errorText = "Game is full.";
  res.render('index', { title: 'Puzzle With Me', isHost: true, hasError: true, error: errorText});
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
