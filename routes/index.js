var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Puzzle With Me' });
});

router.get('/start', function(req, res, next) {
  res.redirect('/');
});

router.get('/wait', function(req, res, next) {
  res.redirect('/');
});

router.get('/rules', function(req, res, next) {
  res.redirect('/');
});

router.get('/play', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
