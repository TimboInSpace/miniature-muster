/*
    Export the SQLite database into a simple JSON document.
    Include queries to produce the following sets:
        - all units
        - all modifiers
        - all unitmodifiers
        - all units with all modifiers ("unitswithmodifiers")
    Then put all that data into ./public/database.json
*/

// This filename is referenced by the client in script.js. dont change it!
const jsonFileName = 'database.json'; 

const connection = require('./sqlite-db.js').getConnection();
const queries = require('./sql.js');
const fs = require('fs');

function saveJSON(obj) {
    // Convert the JSON data to a string
    const jsonString = JSON.stringify(obj, null, 2);
    // Specify the file path
    const filePath = `public/${jsonFileName}`;
    // Write the JSON string to a file
    fs.writeFile(filePath, jsonString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log(`JSON file has been written successfully: ${filePath}`);
        }
    });
}

async function dumpDatabase() {
    // Dump the whole database into these variables:
    const allunits = await connection.selectQuery(queries.selectAllUnits);
    const allmodifiers = await connection.selectQuery(queries.selectAllModifiers);
    const allunitmodifiers = await connection.selectQuery(queries.selectAllUnitModifiers);
    const allunitswithmodifiers = await connection.selectQuery(queries.selectAllUnitsWithModifiers);

    // Save the data into database.json
    saveJSON({
        units: allunits,
        modifiers: allmodifiers,
        unitmodifiers: allunitmodifiers,
        unitswithmodifiers: allunitswithmodifiers
    });
}

dumpDatabase();