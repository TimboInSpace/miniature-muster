var express = require('express');
const app = require('../app');
var router = express.Router();
const queries = require('../sql.js');
const connection = require('../sqlite-db.js').getConnection();

var allunits, allmodifiers, allunitmodifiers, allunitswithmodifiers;

var hosturi = process.env.HOST_URI || "https://lotr.timsullivan.online";

async function selectAllData() {
  allunits = await connection.selectQuery(queries.selectAllUnits);
  allmodifiers = await connection.selectQuery(queries.selectAllModifiers);
  allunitmodifiers = await connection.selectQuery(queries.selectAllUnitModifiers);
  allunitswithmodifiers = await connection.selectQuery(queries.selectAllUnitsWithModifiers);
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
