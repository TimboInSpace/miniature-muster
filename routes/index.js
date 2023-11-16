var express = require('express');
const app = require('../app');
var router = express.Router();
const queries = require('../sql.js');
const connection = require('../database.js').getConnection();

var allunits, allmodifiers, allunitmodifiers, allunitswithmodifiers;

async function selectAllData() {
  allunits = await connection.selectQuery(queries.selectAllUnits);
  allmodifiers = await connection.selectQuery(queries.selectAllModifiers);
  allunitmodifiers = await connection.selectQuery(queries.selectAllUnitModifiers);
  allunitswithmodifiers = await connection.selectQuery(queries.selectAllUnitsWithModifiers);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Miniature Muster', allunits, allmodifiers, allunitmodifiers, allunitswithmodifiers });
});

router.get('/new', function(req,res,next) {
  res.clearCookie('data');
  res.redirect('/');
});

selectAllData();

module.exports = router;
