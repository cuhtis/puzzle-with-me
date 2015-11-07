var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Session = mongoose.model('Session');
var Player = mongoose.model('Player');

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.post('/create', function(req, res, next) {
  var newHost = new Player({
    username: req.body.username,
    isHost: true,
    paid: true,
    betAmt: req.body.bet 
  });

  newHost.save(function() {
    var newSession = new Session({
      host: req.body.username,
      num_players: 1,
      games: [],
      players: [newHost],
      bet_pot: req.body.bet,
      active: false
    });

    newSession.save(function(){
      res.redirect('/game/host/' + newSession.id);
    });
  });

});

router.get('/join/:session_id', function(req, res, next) {
  res.render('index', { title: 'Puzzle With Me', isHost: false, session: req.params.session_id});
});

router.post('/join', function(req, res, next) {
  var newPlayer = new Player({
    username: req.body.username,
    isHost: false,
    paid: true,
    betAmt: req.body.bet 
  });
  newPlayer.save(function() {
    res.render('play', {isHost: false});
  }); 
});

router.get('/host/:session_id', function(req, res, next) {
  // Do stuff as host
  // the session id is gotten from the var at req.params.session_id
  Session.findOneAndUpdate({id: req.params.session_id, active:false}, {$set: {active: true}}, function(err, session, count) {
    var copyURL = req.protocol + "://" + req.get('host') + "/game/join/" + req.params.session_id;
    res.render('play', {copyURL: copyURL, isHost: true});
  });
});

module.exports = router;
