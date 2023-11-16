
const dbVersion = 1.0;
const initialSerialNumber = 1000000;

const createTableParams = `
CREATE TABLE Params (
    paramID INTEGER PRIMARY KEY,
    key TEXT UNIQUE,
    val TEXT
);`;

const initializeParams = `INSERT INTO Params (key,val) VALUES 
    ("dbVersion", ${dbVersion}), 
    ("nextSerialNumber", ${initialSerialNumber})
`;

const createTableUnits = `
CREATE TABLE Units (
    unitID INTEGER PRIMARY KEY,
    pts INTEGER NOT NULL,
    name TEXT UNIQUE,
    melee INTEGER NOT NULL,
    ranged INTEGER,
    strength INTEGER NOT NULL,
    defence INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    wounds INTEGER NOT NULL,
    courage INTEGER NOT NULL,
    might INTEGER DEFAULT 0,
    will INTEGER DEFAULT 0,
    fate INTEGER DEFAULT 0
);`;

const createTableModifiers = `
CREATE TABLE Modifiers (
    modifierID INTEGER PRIMARY KEY, 
    pts INTEGER DEFAULT 0, 
    name TEXT UNIQUE, 
    melee DEFAULT 0, 
    ranged  DEFAULT 0, 
    strength INTEGER DEFAULT 0, 
    defence INTEGER DEFAULT 0, 
    attack INTEGER DEFAULT 0, 
    wounds INTEGER DEFAULT 0, 
    courage INTEGER DEFAULT 0, 
    might INTEGER DEFAULT 0, 
    will INTEGER DEFAULT 0, 
    fate INTEGER DEFAULT 0, 
    details TEXT
);`;

const createTableUnitModifiers = `
CREATE TABLE UnitModifiers (
    unitModifierID INTEGER PRIMARY KEY, 
    unitID INTEGER NOT NULL, 
    modifierID INTEGER NOT NULL, 
    FOREIGN KEY (unitID) 
        REFERENCES Units (unitID) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT, 
    FOREIGN KEY (modifierID)  
        REFERENCES Modifiers (modifierID) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT 
)
`;

const initializeUnits = `INSERT INTO Units (unitID, pts, name, melee, ranged, strength, defence, attack, wounds, courage) VALUES
( 1, 9, "High Elf Warrior",     6, 3, 3, 5, 1, 1, 5),
( 2, 6, "Warrior of Rohan",     3, 4, 3, 4, 1, 1, 3),
( 3, 13, "Rider of Rohan",      3, 4, 3, 5, 1, 1, 3),
( 4, 0,  "Horse",               0, 0, 3, 4, 0, 1, 3)
`;

const initializeModifiers = `INSERT INTO Modifiers (modifierID, name, pts, melee, ranged, strength, defence, attack, wounds, courage, might, will, fate, details) VALUES
(1, "Elven cloak", 10,          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Cannot be seen further than 6in when partially concealed"), 
(2, "Horse", 10,                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""), 
(3, "Armor", 5,                 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, ""), 
(4, "Hero Bow", 5,              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""), 
(5, "Bow", 1,                   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""), 
(6, "Shield", 1,                0, 0, 0, 1, 0, 0, 0, 0, 0, 0, ""), 
(7, "Two-handed sword", 1,      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "-1 to fight rolls, then +1 to wound rolls."), 
(8, "Throwing spear", 0,        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Single-use throwable. Can be used during Shoot phase or while charging during Move phase."),
(9, "Royal Standard of Rohan", 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Any hero of Rohan within 6in with 0 might replenishes 1 might.") 
`;

const initializeUnitModifiers = `INSERT INTO UnitModifiers (unitID, modifierID) VALUES 
(1, 7), (1, 5), (1, 6), 
(2, 8), (2, 5), (2, 6),
(3, 8)
`;

const selectAllUnits = `SELECT * FROM Units;`;
const selectAllModifiers = `SELECT * FROM Modifiers;`;
const selectAllUnitModifiers = `SELECT * FROM UnitModifiers;`;
const selectAllUnitsWithModifiers = `
SELECT * FROM Units U LEFT JOIN UnitModifiers UM ON U.unitID = UM.unitID LEFT JOIN Modifiers M ON M.modifierID = UM.modifierID;
`;


module.exports = {
    dbVersion,
    createTableParams,
    initializeParams,
    createTableUnits,
    initializeUnits,
    createTableModifiers,
    initializeModifiers,
    createTableUnitModifiers,
    initializeUnitModifiers,
    selectAllUnits,
    selectAllModifiers,
    selectAllUnitModifiers,
    selectAllUnitsWithModifiers,
}