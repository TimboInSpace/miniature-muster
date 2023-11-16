const sqlite3 = require('sqlite3').verbose();
const { resolve } = require('path');
const path = require('path');
const queries = require('./sql.js');

class DbConnection {

    constructor() {
        // Connect to SQLite
        this.db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));
        // Create tables if they dont exist yet
        this.initializeTables();
    }

    initializeTables() {
        this.shouldRebuildDatabase().then((shouldRebuild => {
            if (shouldRebuild || true) {
                console.log('The database should be rebuilt');
                this.rebuildDatabase3();
                console.info('Successfully rebuilt database.');
            } else {
                console.log('Database is at current version');
            }
        })).catch((err)=>{
            console.error(`Encountered an error while checking if the database should be rebuilt:\n${err}`);
        });
    }

    shouldRebuildDatabase() {
        // Check if Params table does not exist, 
        // or if key="dbVersion" is not found in Params,
        // or if the dbVersion it found is older than the one from sql.js
        return new Promise((resolve, reject) => {
            this.db.get('SELECT val from Params WHERE key = "dbVersion"', [], (err,row) => {
                if (err) {
                    console.log(err);
                    resolve(true);
                }
                if (!row || parseFloat(row.val) < queries.dbVersion) {
                    resolve(true);
                }
                resolve(false);
            });
        });
    }

    rebuildDatabase3() {
        const rebuildQueries = [    
            queries.createTableParams,
            queries.initializeParams,
            queries.createTableUnits,
            queries.createTableModifiers,
            queries.createTableUnitModifiers,
            queries.initializeUnits,
            queries.initializeModifiers,
            queries.initializeUnitModifiers
        ];
        this.db.serialize(() => {
            this.db.run("DROP TABLE IF EXISTS Params;");
            this.db.run("DROP TABLE IF EXISTS Units;");
            this.db.run("DROP TABLE IF EXISTS Modifiers;");
            this.db.run("DROP TABLE IF EXISTS UnitModifiers;");
            rebuildQueries.forEach( (qry) => {
                console.info(`Running query: ${qry}`);
                this.db.run(qry, (err) => {if (err) {console.log(`${qry}:\n${err}`);}});
            });
            // queries.insertSampleData.forEach( (qry) => {
            //     this.db.run(qry, (err) => {if (err) {console.log(`${qry}:\n${err}`);}});
            // });
        });
    }

    disconnect() {
        console.info('Disconnecting from database.');
        this.db.close();
    }

    async getData() {
        let output = "";
        await new Promise((resolve, reject) => {
            this.db.each("SELECT key, val FROM Params", [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    output += `${row.key}: ${row.val}\n`;
                }
            }, (err,count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(output);
                }
            });
        });
        return output;
    }

    async selectQuery(qry, args = []) {
        let output = [];
        await new Promise((resolve, reject) => {
            this.db.each(qry, args, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    output.push(row);
                }
            }, (err,count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(output);
                }
            });
        });
        return output;
    }

}

class Database {

    constructor() {
        throw new Error('Called constructor on singleton class. Use getConnection() instead.')
    }

    static getConnection() {
        if (!Database.connection) {
            Database.connection = new DbConnection();
        }
        return Database.connection;
    }

}


module.exports = Database;