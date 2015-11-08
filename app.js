// YHACKS 2015
// Michelle Chen, Kristin Ho, Curtis Li, Noah Cheng, Carter Yu
//
// APP.JS
//
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var random = require('mongoose-simple-random');

// Vars
var totalOnline = 0;


// Mongoose
require('./models/session');
require('./models/player');
require('./models/puzzle');
mongoose.connect('mongodb://curtis:curtis@ds051334.mongolab.com:51334/heroku_7mb729v5');
var Session = mongoose.model('Session');
var Player = mongoose.model('Player');
var Puzzle = mongoose.model('Puzzle');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Other
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var sessionOptions = { 
  secret: 'secret for signing session id', 
  saveUninitialized: false, 
  resave: false 
};
app.use(session(sessionOptions));

app.get('/', function(req, res) { // change ready and unpaid
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

app.get('/rules', function(req, res) {
  res.render('rules', { title: 'Rules' });
});

app.get('/quit', function(req, res, next) {
  req.session.activeSession = false;
  res.redirect('/');
});

app.get('/error', function(req, res) {
  var errorText = "Unknown error.";
  if (req.query.type === "notfound") errorText = "Session not found.";
  if (req.query.type === "full") errorText = "Game is full.";
  res.render('index', { title: 'Puzzle With Me', isHost: true, hasError: true, error: errorText});
});

app.get('/game', function(req, res, next) {
  res.redirect('/');
});

app.post('/game/create', function(req, res) {
  if (req.body.username === "") req.body.username = "Guest";
  var newHost = new Player({
    username: req.body.username,
    isHost: true,
    paid: true,
    betAmt: req.body.bet,
    isReady: false 
  });

  newHost.save(function() {
    var newSession = new Session({
      host: req.body.username,
      num_players: 1,
      games: [],
      players: [newHost],
      bet_pot: req.body.bet,
      active: false,
      num_ready: 1,
      allReady: false
    });

    if (newSession.num_players > 1 && newSession.num_players == newSession.num_ready){
      newSession.allReady = true;
    }

    newSession.save(function(){
      req.session.username = req.body.username;
      req.session.activeSession = newSession.id;
      res.redirect('/game/host/' + newSession.id);
    });
  });

});

app.get('/game/invite/:session_id', function(req, res) {
  var errorText = "Unknown error.";
  var hasError = false;
  if (req.query.error === "taken") {
    hasError = true;
    errorText = "Name is already taken.";
  }
  res.render('index', { title: 'Puzzle With Me', isHost: false, session: req.params.session_id, hasError: hasError, error: errorText});
});

app.post('/game/join', function(req, res) {
  if (req.body.username === "") req.body.username = "Guest";
  var newPlayer = new Player({
    username: req.body.username,
    isHost: false,
    paid: true,
    betAmt: req.body.bet,
    isReady: false
  });
  newPlayer.save(function() {
    Session.findOne({_id: req.body.session}, function(err, session){
      if (err || session == undefined) res.redirect('/error?type=notfound');
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

app.get('/game/join/:session_id', function(req, res) {
  Session.findOne({_id: req.params.session_id}, function(err, session, count) {
    if (err || session == undefined || req.session.username == undefined) res.redirect('/error?type=notfound');
    else {
      // FIND INDEX OF REQ PLAYER MANUALLY
      var my_index = -1; var cnt = 0;
      session.players.forEach(function(player){
        if (player.username === req.session.username) { my_index = cnt; }
        cnt++;
      });
      var host_player = session.players[0];
      var my_player = session.players[my_index];
      var other_players = session.players.filter(function(e) { console.log(e); return e.username !== host_player.username && e.username !== my_player.username; });

      var hasUserName = [false,false,false,false];
      if(session){
        for (numPlayers = 0; numPlayers <= session.num_players-1; numPlayers++){
          hasUserName[numPlayers]=true;
        }
      }

      res.render('wait', { title: 'Puzzle With Me', isHost: false, host: host_player, me: my_player, others: other_players, hasUserName: hasUserName, session_id: req.params.session_id });
    }
  });
});

app.get('/game/host/:session_id', function(req, res) {
  // Do stuff as host
  // the session id is gotten from the var at req.params.session_id
  Session.findOne({_id: req.params.session_id}, function(err, session) {
    if (err || session == undefined || req.session.username == undefined) res.redirect('/error?type=notfound');
    else {
      var copyURL = req.protocol + "://" + req.get('host') + "/game/invite/" + req.params.session_id;

      // FIND INDEX OF REQ PLAYER MANUALLY
      var my_index = -1; var cnt = 0;
      session.players.forEach(function(player){
        if (player.username === req.session.username) { my_index = cnt; }
        cnt++;
      });
      //var my_index = session.players.indexOf(req.session.username);
      var host_player = session.players[0];
      var my_player = session.players[my_index];
      
      var other_players = session.players.filter(function(e) { console.log(e); return e.username !== host_player.username; });
      var hasUserName = [false,false,false,false];
      if(session){
        for (numPlayers = 0; numPlayers <= session.num_players-1; numPlayers++){
          hasUserName[numPlayers]=true;
        }
      }

      res.render('wait', { title: 'Puzzle With Me', copyURL: copyURL, isHost: true, me: my_player, host: host_player, others: other_players, hasUserName: hasUserName, session_id: req.params.session_id});
    }
  });
});

app.post('/game/join/:session_id', function(req, res){
  console.log("HELLOOOOO");
  console.log(req.session.username);
  console.log(req.params.session_id);
  Session.findOne({_id: req.params.session_id}, function(err, session){
    Player.findOne({username: req.session.username}, function(err, player) {
      player.ready = true;
      session.num_ready += 1;
      if (session.num_players == session.num_ready){
        session.allReady = true;
      }

      player.save(function() {
        session.save(function() {
          console.log(player);
          console.log(session);
          res.redirect("/");
        });
      });
    });
  });
});

app.get('/game/play/:session_id', function(req, res) {
  Session.findOne({_id: req.params.session_id}, function(err, session) {
    if (err || session == undefined || req.session.username == undefined) res.redirect('/error?type=notfound');
    else {
      Puzzle.count(function(err,cnt) {
        if (err) res.redirect('/error?type=notfound');
        else {
          var randNum = Math.ceil(Math.random()*cnt);
          Puzzle.findOne({qid: randNum}, function(err,result) {
            console.log("qid: ", randNum, "result: ", result);
            if (err || session == undefined || req.session.username == undefined) res.redirect('/error?type=notfound');
            else {
              // FIND INDEX OF REQ PLAYER MANUALLY
              var my_index = -1; var cnt = 0;
              session.players.forEach(function(player){
                if (player.username === req.session.username) { my_index = cnt; }
                cnt++;
              });
              var my_player = session.players[my_index];
              var other_players = session.players.filter(function(e) { console.log(e); return e.username != my_player.username; });

              var hasUserName = [false,false,false,false];
              if(session){
                for (numPlayers = 0; numPlayers <= session.num_players-1; numPlayers++){
                  hasUserName[numPlayers]=true;
                }
              }

              res.render('play', {session: session, question: result.question, me: my_player, others: other_players, hasUserName: hasUserName});
            }
          });
        }
      });
    }
  });
});

app.post('/game/play/:session_id', function(req, res) {
  console.log("Receiving answer from user ", req.session.username, "...");
});



io.on('connection', function (socket) {
  console.log('User connected, total online:', totalOnline);
  totalOnline += 1;
  
  socket.on('logon', function (data) {
    console.log(data.name, "has logged on.");
    io.emit('newUser', { name: data.name });
  });

  socket.on('disconnect', function () {
    console.log('user disconnected, total online:', totalOnline);
    totalOnline -= 1;
  });
  
  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
  });

  socket.on('notification_ready', function (session_id, username){
    Session.findOne({_id: session_id}, function(err, session){
      for (var num_players = 0; num_players < session.num_players; num_players++){
        if(session.players.username === username){
          session.player.isReady = true;
        }
      }
    });
    io.emit('notification_ready', username, true);
  });

});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

http.listen(port, function() {
  console.log("Started listening on port", port);
});
