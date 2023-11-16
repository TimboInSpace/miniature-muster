var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const datacookie = req.cookies.data;
  if (!datacookie) {
    res.cookie('data', JSON.stringify({step: 1, players:[]}),{maxAge: 900000, httpOnly: true, sameSite: 'Strict'});
  }
  console.log(`Logging cookie: ${datacookie}`);
  res.render('index', { title: 'Miniature Muster', data: datacookie});
});

router.get('/new', function(req,res,next) {
  res.clearCookie('data');
  res.redirect('/');
});

module.exports = router;
