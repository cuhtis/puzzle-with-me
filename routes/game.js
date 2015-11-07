var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Session = mongoose.model('Session');
var Player = mongoose.model('Player');

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.post('/create', function(req, res, next) {
  if (req.body.username === "") req.body.username = "Guest";
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
      req.session.username = req.body.username;
      req.session.activeSession = newSession.id;
      console.log(req.sessionID, req.session.username);
      res.redirect('/game/host/' + newSession.id);
    });
  });

});

router.get('/invite/:session_id', function(req, res, next) {
  var errorText = "Unknown error.";
  var hasError = false;
  if (req.query.error === "taken") {
    hasError = true;
    errorText = "Name is already taken.";
  }
  res.render('index', { title: 'Puzzle With Me', isHost: false, session: req.params.session_id, hasError: hasError, error: errorText});
});

router.post('/join', function(req, res, next) {
  if (req.body.username === "") req.body.username = "Guest";
  var newPlayer = new Player({
    username: req.body.username,
    isHost: false,
    paid: true,
    betAmt: req.body.bet 
  });
  newPlayer.save(function() {
    Session.findOne({_id: req.body.session}, function(err, session){
      if (err) res.redirect('/error?type=notfound');
      else if (session.num_players >= 4) res.redirect('/error?type=full');
      else if (session.players.map(function(e) { return e.username; }).indexOf(req.body.username) > -1) res.redirect('/game/invite/'+req.body.session+"?error=taken");
      else {
        req.session.username = req.body.username;
        req.session.activeSession = req.body.session;
        session.num_players += 1;
        session.players.push(newPlayer);
        session.save(function() {
          res.redirect('/game/join/'+req.body.session);
        });
      }
    });
  }); 
});

router.get('/join/:session_id', function(req, res, next) {
  Session.findOne({_id: req.params.session_id}, function(err, session, count) {
    if (err) res.redirect('/error?type=notfound');
    else {
      res.render('play', { title: 'Puzzle With Me', isHost: false, players: session.players });
    }
  });
});

router.get('/host/:session_id', function(req, res, next) {
  // Do stuff as host
  // the session id is gotten from the var at req.params.session_id
  Session.findOne({_id: req.params.session_id}, function(err, session) {
    if (err) res.redirect('/error?type=notfound');
    else {
      var copyURL = req.protocol + "://" + req.get('host') + "/game/invite/" + req.params.session_id;
      console.log(session, req.sessionID);
      var my_player = session.players[session.players.indexOf(req.session.username)];
      console.log(my_player);
      var host_player = session.players[session.players.indexOf(session.host)];
      var other_players = session.players.filter(function(e) { return e.username !== req.session.username; });
      res.render('wait', { title: 'Puzzle With Me', copyURL: copyURL, isHost: true, me: my_player, host: host_player, others: other_players});
    }
  });
});

module.exports = router;
