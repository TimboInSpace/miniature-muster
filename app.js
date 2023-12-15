var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Load the .env file if it exists.
if (require('fs').existsSync('.env')) {
  require('dotenv').config(); // Load the .env file. The contents will be in process.env.[varname]
}

app.use(logger('dev')); // TODO: change this to prod?
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/index'));

// if (process.env.DB_TYPE && process.env.DB_TYPE === 'mysql') {
//   // Use MySQL
//   const { MySqlDatabase } = require('./mysql-db.js');
//   const db = new MySqlDatabase();
//   async function testSql() {
//     var connection = await db.connect({
//       host: process.env.MYSQL_HOST,
//       port: process.env.MYSQL_PORT || 3306,
//       user: process.env.MYSQL_APP_USER,
//       password: process.env.MYSQL_APP_PASS,
//       database: process.env.MYSQL_DATABASE
//     });
//     try {
//       const result = await db.query('SELECT * FROM Params');
//       console.log('Query result:', result);
//     } catch (error) {
//       console.error('Error executing query:', error);
//     }
//   }
//   testSql();
//   app.locals.db = db;
// }
// if (process.env.DB_TYPE && (process.env.DB_TYPE === 'sqlite' || process.env.DB_TYPE === 'sqlite3')) {
//   var connection = require('./sqlite-db.js').getConnection();
//   app.locals.db = connection;
// }


// app.locals.allunits = app.locals.db.getData();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Print Node.js version, npm version
const { execSync } = require('child_process');
const npmVersion = execSync('npm -v').toString().trim();
console.info(`miniature-muster is running using node ${process.version} and npm ${npmVersion}`);

module.exports = app;
