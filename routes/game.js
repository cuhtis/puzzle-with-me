var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('/host');
});

router.get('/host', function(req, res, next) {
  res.render('host');
});

module.exports = router;
