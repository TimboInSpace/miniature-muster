
const dbVersion = 1.0;
const initialSerialNumber = 1000000;

const createTableParams = `
CREATE TABLE Params (
    paramID INTEGER PRIMARY KEY,
    param_key TEXT UNIQUE,
    param_val TEXT
);`;

const initializeParams = `INSERT INTO Params (param_key,param_val) VALUES 
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
    fate INTEGER DEFAULT 0,
    rangedstrength INTEGER DEFAULT 0
);`;

const createTableModifiers = `
CREATE TABLE Modifiers (
    modifierID INTEGER PRIMARY KEY, 
    pts INTEGER DEFAULT 0, 
    name TEXT, 
    melee INTEGER DEFAULT 0, 
    ranged INTEGER DEFAULT 0, 
    strength INTEGER DEFAULT 0, 
    defence INTEGER DEFAULT 0, 
    attack INTEGER DEFAULT 0, 
    wounds INTEGER DEFAULT 0, 
    courage INTEGER DEFAULT 0, 
    might INTEGER DEFAULT 0, 
    will INTEGER DEFAULT 0, 
    fate INTEGER DEFAULT 0, 
    details TEXT,
    rangedstrength INTEGER DEFAULT 0
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

const initializeUnits = `INSERT INTO Units (unitID, pts, name, melee, ranged, strength, defence, attack, wounds, courage, rangedstrength) VALUES
( 1, 9, "High Elf Warrior",     6, 3, 3, 5, 1, 1, 5, 0),
( 2, 6, "Warrior of Rohan",     3, 4, 3, 4, 1, 1, 3, 0),
( 3, 13,"Rider of Rohan",      3, 4, 3, 5, 1, 1, 3, 2),
( 4, 0, "Horse",               0, 0, 3, 4, 0, 1, 3, 0),
(18, 7, "Wood Elf Warrior",     6, 3, 3, 3, 1, 1, 5, 0),
(19, 6, "Warrior of Gondor",    3, 4, 3, 4, 1, 1, 3, 0),
(26, 4, "Moria Goblin Warrior", 2, 5, 3, 4, 1, 1, 2, 0),
(27, 5, "Orc Warrior",          3, 5, 3, 4, 1, 1, 2, 0),
(28, 10,"Uruk-Hai Warrior",     4, 4, 4, 5, 1, 1, 3, 0),
(29, 15,"Uruk-Hai Berserker",   4, 0, 4, 6, 2, 1, 8, 0),
(30, 70,"Cave Troll",           6, 6, 6, 6, 3, 3, 3, 0)
`;

const initializeHeroes = `INSERT INTO Units (unitID, pts, name, melee, ranged, strength, defence, attack, wounds, courage, might, will, fate, rangedstrength) VALUES
( 5, 65, "Frodo",               3, 0, 2, 3, 1, 2, 6,    3, 3, 3, 0), 
( 6, 30, "Sam Gamgee",          3, 0, 2, 3, 1, 2, 5,    1, 1, 2, 0), 
( 7, 80, "Gimli",               6, 0, 4, 8, 2, 2, 6,    3, 2, 2, 0), 
( 8, 85, "Legolas",             6, 3, 4, 4, 2, 2, 6,    3, 2, 2, 3), 
( 9, 175, "Aragorn",            6, 3, 4, 5, 3, 3, 6,    3, 3, 3, 3), 
( 10, 120, "Elrond",            6, 0, 4, 7, 3, 3, 7,    3, 3, 3, 0), 
( 11, 55, "Haldir",             6, 3, 4, 4, 2, 2, 5,    3, 1, 1, 3), 
( 12, 50, "Elven Captain",      6, 3, 4, 4, 2, 2, 5,    2, 1, 1, 3), 
( 13, 30, "Captain of Humans",  4, 4, 4, 4, 2, 2, 4,    2, 1, 1, 2), 
( 14, 60, "Theoden",            5, 0, 4, 5, 2, 2, 5,    2, 0, 2, 0), 
( 15, 25, "Eowyn",              4, 0, 3, 3, 1, 1, 5,    1, 1, 1, 0), 
( 16, 40, "Gamling",            4, 4, 4, 5, 2, 2, 4,    2, 1, 1, 0), 
( 17, 200, "Gandalf the White", 5, 0, 5, 6, 1, 3, 7,    3, 6, 3, 0), 
( 20, 400, "Sauron",            9, 0, 8,10, 3, 5, 7,    3, 3, 0, 0), 
( 23, 150, "Saruman",           5, 0, 4, 5, 1, 3, 7,    3, 6, 3, 0), 
( 21, 40, "Orc Captain",        4, 5, 4, 4, 2, 2, 3,    2, 1, 1, 0), 
( 22, 35, "Moria Goblin Captain",3,5, 4, 4, 2, 2, 3,    2, 1, 1, 0), 
( 24, 50, "Uruk-Hai Captain",   5, 4, 4, 5, 2, 2, 4,    2, 1, 1, 0), 
( 25, 0, "Gollum",              4, 0, 4, 4, 2, 2, 4,    1, 0, 1, 0)
`;

const initializeModifiers = `INSERT INTO Modifiers (modifierID, name, pts, melee, ranged, strength, defence, attack, wounds, courage, might, will, fate, details, rangedstrength) VALUES
(1, "Elven cloak", 10,          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Cannot be seen further than 6in when partially concealed", 0), 
(2, "Horse", 10,                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", 0), 
(3, "Armor", 5,            0, 0, 0, 1, 0, 0, 0, 0, 0, 0, "Adds 1 to defence.", 0), 
(4, "Bow", 5,                   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", 0), 
(5, "Human Bow", 1,             0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "24in range, 2S, half movement penalty.", 2), 
(6, "Shield", 1,                0, 0, 0, 1, 0, 0, 0, 0, 0, 0, "Adds 1 to defence. provides shielding ability.", 0), 
(7, "Two-handed sword", 1,      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "-1 to fight rolls, then +1 to wound rolls.", 0), 
(14,"Two-handed sword (free)",0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "-1 to fight rolls, then +1 to wound rolls.", 0), 
(8, "Throwing spear", 0,        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Single-use throwable. Can be used during Shoot phase or while charging during Move phase.", 0),
(9, "Royal Standard of Rohan",25,0,0, 0, 0, 0, 0, 0, 0, 0, 0, "Any hero of Rohan within 6in with 0 might replenishes 1 might.", 0), 
(10, "Elven Bow", 1,            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "24in range, 3S, half movement penalty.", 3), 
(11, "Orcish Bow", 1,           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "18in range, 2S, half movement penalty.", 2),
(12, "Sting", 15,               0, 0, 1, 0, 0, 0, 0, 0, 0, 0, "Adds 1 to strength.", 0),
(13, "Mithril coat", 25,        0, 0, 0, 3, 0, 0, 0, 0, 0, 0, "Adds 3 to defence.", 0),
(15, "Heavy armor", 10,         0, 0, 0, 2, 0, 0, 0, 0, 0, 0, "Adds 2 to defence.", 0),
(16, "Shield", 5,               0, 0, 0, 1, 0, 0, 0, 0, 0, 0, "Adds 1 to defence. provides shielding ability.", 0),
(17, "Hero throwing spear", 5,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Single-use throwable. Can be used during Shoot phase or while charging during Move phase.", 0),
(18, "Shadowfax", 15,           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "The mightiest of all horses of Rohan.", 0),
(19,"Two-handed sword or spear",0,0,0,0, 0, 0, 0, 0, 0, 0, 0, "-1 to fight rolls, then +1 to wound rolls.", 0),
(20, "Armor", 1,                0, 0, 0, 1, 0, 0, 0, 0, 0, 0, "Adds 1 to defence", 0),
(21, "Orcish Bow", 5,           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "18in range, 2S, half movement penalty.", 2), 
(22, "Warg", 10,                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", 0), 
(23, "Crossbow", 5,             0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "24in range, 4S, FULL movement penalty.", 4), 
(24, "Spear (free)", 0,         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Can attack through a melee attacker.", 0), 
(25, "Pike", 1,                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Can attack through two units.", 0), 
(26, "Spear", 5,                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Can attack through a melee attacker.", 0), 
(27, "Troll chain", 5,          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "After winning a fight, roll D6. if D6 gt enemy fight or D6 = 6, roll for one extra wound.", 0),
(28, "Crossbow", 1,             0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "24in range, 4S, FULL movement penalty.", 4)
`;

const initializeUnitModifiers = `INSERT INTO UnitModifiers (unitID, modifierID) VALUES 
(1, 7), (1, 10), (1, 6), 
(2, 8), (2, 5), (2, 6),
(3, 8),
(5, 1), (5,12), (5,13),
(6,1), (7,1), (8,1), (8,3), (8,2),
(9,1), (9,3), (9,4), (9,2),
(11, 4), (11,1), (11,3),
(12,14), (12,3), (12,15), (12,16), (12,4), 
(13,3), (13,16), (13,4), (13,17), (13,2),
(14, 16), (14, 2), (15, 2), (16, 2), (16, 9), (17, 18), 
(18, 19), (18,10), (18,6), (18,20), 
(19, 8), (19, 5), (19, 6), 
(21, 16), (21, 21), (21, 22), 
(22, 16), (21, 21), 
(24, 16), (24, 21), (24,23), 
(26, 24), (26, 11), (26, 6), 
(27, 24), (27, 11), (27, 6), 
(28, 11), (28, 28), (28, 25), (28, 6), 
(30, 26), (30, 27)

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
    initializeHeroes,
    createTableModifiers,
    initializeModifiers,
    createTableUnitModifiers,
    initializeUnitModifiers,
    selectAllUnits,
    selectAllModifiers,
    selectAllUnitModifiers,
    selectAllUnitsWithModifiers,
}