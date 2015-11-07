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
      //console.log("SESSION_ID MADE: ", req.body.session);
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
    console.log("SESSION_ID: ", req.params.session_id);
    console.log("RESULTS: ", session);
    if (err || session == undefined) res.redirect('/error?type=notfound');
    else {
      var copyURL = req.protocol + "://" + req.get('host') + "/game/invite/" + req.params.session_id;
      //console.log(session, req.sessionID);
      console.log("SESSION: ", req.session);

      // FIND INDEX OF REQ PLAYER MANUALLY
      var my_index = -1; var cnt = 0;
      session.players.forEach(function(player){
        console.log("PLAYER LOOP: ", cnt, player);
        if (player.username === req.session.username) { my_index = cnt; }
        cnt++;
      });
      //var my_index = session.players.indexOf(req.session.username);
      var host_player = session.players[0];
      var my_player = session.players[my_index];
      console.log("MY INDEX: ", my_index);
      console.log("MY PLAYER: ", my_player);

      console.log("HOST: ", host_player);
      console.log(session.players);
      var other_players = session.players.filter(function(e) { console.log(e); return e.username !== host_player.username; });
      console.log("OTHERS: ", other_players);
      res.render('play', { title: 'Puzzle With Me', isHost: false, players: session.players });
    }
  });
});

router.get('/host/:session_id', function(req, res, next) {
  // Do stuff as host
  // the session id is gotten from the var at req.params.session_id
  Session.findOne({_id: req.params.session_id}, function(err, session) {
    console.log("SESSION_ID: ", req.params.session_id);
    console.log("RESULTS: ", session);
    if (err || session == undefined) res.redirect('/error?type=notfound');
    else {
      var copyURL = req.protocol + "://" + req.get('host') + "/game/invite/" + req.params.session_id;
      //console.log(session, req.sessionID);
      console.log("SESSION: ", req.session);

      // FIND INDEX OF REQ PLAYER MANUALLY
      var my_index = -1; var cnt = 0;
      session.players.forEach(function(player){
        console.log("PLAYER LOOP: ", cnt, player);
        if (player.username === req.session.username) { my_index = cnt; }
        cnt++;
      });
      //var my_index = session.players.indexOf(req.session.username);
      var host_player = session.players[0];
      var my_player = session.players[my_index];
      console.log("MY INDEX: ", my_index);
      console.log("MY PLAYER: ", my_player);

      console.log("HOST: ", host_player);
      console.log(session.players);
      var other_players = session.players.filter(function(e) { console.log(e); return e.username !== host_player.username; });
      console.log("OTHERS: ", other_players);
      res.render('wait', { title: 'Puzzle With Me', copyURL: copyURL, isHost: true, me: my_player, host: host_player, others: other_players});
    }
  });
});

module.exports = router;
