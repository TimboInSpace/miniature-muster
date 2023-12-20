var express = require('express');
const app = require('../app');
var router = express.Router();
const queries = require('../sql.js');
// const connection = require('../sqlite-db.js').getConnection();

const fs = require('fs');

var allunits, allmodifiers, allunitmodifiers, allunitswithmodifiers;
var hosturi = process.env.HOST_URI || "https://lotr.timsullivan.online";

function saveJSON(obj) {
  // Convert the JSON data to a string
  const jsonString = JSON.stringify(obj, null, 2);
  // Specify the file path
  const filePath = '/home/tim/Desktop/database.json';
  // Write the JSON string to a file
  fs.writeFile(filePath, jsonString, 'utf8', (err) => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } else {
      console.log('JSON file has been written successfully!');
    }
  });
}

async function selectAllData() {
  if (!process.env.DB_TYPE) {
    console.error('No database type was passed as an environment variable. Could not load data');
  }
  if (process.env.DB_TYPE.toLowerCase() === 'sqlite' || process.env.DB_TYPE === 'sqlite3') {
    allunits = await connection.selectQuery(queries.selectAllUnits);
    allmodifiers = await connection.selectQuery(queries.selectAllModifiers);
    allunitmodifiers = await connection.selectQuery(queries.selectAllUnitModifiers);
    allunitswithmodifiers = await connection.selectQuery(queries.selectAllUnitsWithModifiers);
    // Temporarily: save the data into ../public/database.json
    // saveJSON({
    //   units: allunits,
    //   modifiers: allmodifiers,
    //   unitmodifiers: allunitmodifiers,
    //   unitswithmodifiers: allunitswithmodifiers
    // });
  } else if (process.env.DB_TYPE.toLowerCase() === 'mysql') {
    // TODO: implement loading all data using mysql
    // ex.: const result = await mysqlInterface.query('SELECT * FROM your_table');
  } else if (process.env.DB_TYPE.toLowerCase() === 'json') {
    // TODO: Don't look anything up. 
    allunits = null;
    allmodifiers = null;
    allunitmodifiers = null;
    allunitswithmodifiers = null;
  }
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
