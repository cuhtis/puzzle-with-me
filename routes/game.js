var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Session = mongoose.model('Session');

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.post('/create_game', function(req, res, next) {
  var newHost = new Player({
    username: req.body.username,
    isHost: true,
    paid: true,
    betAmt: req.body.bet 
  });

  newHost.save(function() {
    var newSession = new Session({
      session_id: req.body.session_id,
      host: req.body.username,
      num_players: 1,
      games: [],
      players: [newHost],
      bet_pot: req.body.bet
    });
    newSession.save(function(){
      res.redirect('/game/host/'+req.body.session_id);
    });
  });

});

router.get('/join/:session_id', function(req, res, next) {
  // Do stuff as joined player

  // Session id is at req.params.session_id

  res.render('game');
});

router.post('/join/:session_id', function(req, res, next) {
  var newPlayer = new Player({
      username: req.body.username,
      isHost: false,
      paid: true,
      betAmt: req.body.bet 
    });
    
});

router.get('/host/:session_id', function(req, res, next) {
  // Do stuff as host
  // the session id is gotten from the var at req.params.session_id
  
  var copyURL = req.protocol + "://" + req.get('host') + "/game/join/" + req.params.session_id;

  res.render('game', {copyURL: copyURL, isHost: true});
});

module.exports = router;
