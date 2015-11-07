var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Session = mongoose.model('Session');

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.post('/create_game', function(req, res, next) {
  var newSession = new Session({
    host: req.body.username,
    num_players: 1,
    games: [],
    bet_pot: req.body.bet
  });
  newSession.save();

  res.redirect('/game/host/'+newSession.id);
});

router.get('/join/:session_id', function(req, res, next) {
  // Do stuff as joined player

  // Session id is at req.params.session_id
  res.render('game');
});

router.get('/host/:session_id', function(req, res, next) {
  // Do stuff as host
  // the session id is gotten from the var at req.params.session_id
  
  var copyURL = req.protocol + "://" + req.get('host') + "/game/join/" + req.params.session_id;

  res.render('game', {copyURL: copyURL, isHost: true});
});

module.exports = router;
