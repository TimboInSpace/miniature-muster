var express = require('express');
const app = require('../app');
var router = express.Router();

var allunits, allmodifiers, allunitmodifiers, allunitswithmodifiers;
var hosturi = process.env.HOST_URI || "https://lotr.timsullivan.online";

async function selectAllData() {
  // This used to be where the database queries were. If these variables are passed to the client as null,
  // then the client will simply load the JSON dataset instead, eliminating the need for a database at all.
  allunits = null;
  allmodifiers = null;
  allunitmodifiers = null;
  allunitswithmodifiers = null;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Miniature Muster', allunits, allmodifiers, allunitmodifiers, allunitswithmodifiers, hosturi });
});

router.get('/new', function(req,res,next) {
  res.clearCookie('data');
  res.redirect('/');
});

router.get('/load/:cookiedata', function(req,res,next) {
  const decoded = decodeURIComponent(atob(req.params.cookiedata));
  res.cookie('data', decoded, { maxAge: 900000, httpOnly: false, samesite: 'none'});
  res.redirect('/');
});

selectAllData();

module.exports = router;
