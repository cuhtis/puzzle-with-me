var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Session = mongoose.model('Session');
var Player = mongoose.model('Player');

/* GET home page. */
router.get('/', function(req, res, next) { // change ready and unpaid
  var copyURL = req.protocol + '://' + req.get('host') + req.originalUrl + "join_game?game_id=" + req.sessionID;
  res.render('index', { title: 'Puzzle With Me', copyURL: copyURL, ready: true, unpaid: true});
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

router.get('/start', function(req, res, next) {
  res.redirect('/');
});


router.get('/wait/:game_id', function(req, res, next) {
  res.render('wait', {game_id: game_id});


router.get('/rules', function(req, res, next) {
  res.render('rules');
});


router.get('/play/:game_id', function(req, res, next) {
  res.redirect('/play');
});

router.get('/game/join/:game_id', function(req, res, next) {
  res.redirect('/wait/:game_id');



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
