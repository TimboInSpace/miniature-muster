/*
Step 1: Defining players. 
*/

function getCookie(name) {
    var cookieValue = "";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.startsWith(name + "=")) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
        }
    }
    return cookieValue;
}

function setCookie(cookieName, cookieValue, expirationDays = 5) {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/;SameSite=Strict";
}

function renderStep() {
/*
    Before switching "steps", render any content into the window
*/
    const tabs = tabcontainer.querySelectorAll('.tab');
    const currentTab = tabs[state.step-1];
    switch (state.step) {
        case 1:
            // There should be a players array. Show each player in the array.
            const ele = document.querySelector('#players-list');
            if (state.hasOwnProperty('players')) {
                ele.innerHTML = "";
                state.players.forEach((player) => {
                    const itm = document.createElement('li');
                    itm.innerHTML = `${player}`;
                    ele.appendChild(itm);
                });
            }
            // Set the "Previous" button to disabled
            currentTab.querySelector('.prev-step-button').disabled = true;
            break;
        case 2:
            // There should be arrays for units, modifiers, unitmodifiers, and unitswithmodifiers:
            // render the units
            const playerList = document.getElementById('unitSelectionPlayer');
            renderSelectionList(playerList, state.players.map((val,idx) => {return idx}), state.players);
            const unitList = document.getElementById('unitSelectionList');
            renderSelectionList(unitList, units.map((unit,i) => {
                return unit.unitID;
            }), units.map((unit, i) => {
                const modifiers = getModifiersForUnit(unit.unitID);
                // TODO: Add in a section for modifiers
                return `<span>${unit.name}</span><br/>`;
            }), 20);
            const selectionDisplayPane = document.querySelector('.selection-display-pane');
            const unitDisplayTabControl = selectionDisplayPane.querySelector('.player-tab-control');
            if (!unitDisplayTabControl) {
                console.error(`No unit display tab control was found!`);
                break;
            }
            renderArmyDisplay(unitDisplayTabControl);
            break;
        case 3: 
            currentTab.querySelector('.next-step-button').disabled = true;
            break;
        default:
            break;
    }
}

// Make a tab-control with a tab for each player, to display the army
// ele is the div that contains the tab-labels and the tab-container.
// each page is a tab-content
function renderArmyDisplay(ele) {
    if (!state.hasOwnProperty('armies')) {
        ele.innerHTML = '';
        return;
    }
    let tabLabelHTML = '';
    let tabContentHTML = '';
    state.armies.forEach((army) => {
        if (army.player && army.units) {
        // Make a tab-label for each player
        // Make a tab-content for each player
        tabLabelHTML += `<a href='#' class="player-tab-label" onclick="changePlayerTab(event,'${army.player}')">${army.player}</a>`;
        let tabContentListHTML = '';
        army.units.forEach((unit)=> {
            // Collect the HTML for the modifiers
            let unitModsHTML = '';
            let pointCost = unit.unit.pts;
            if (unit.mods) {
                unit.mods.forEach(mod => {
                    unitModsHTML += `
                        <div class="unit-mod-display">
                            <span>${mod.name} (+${mod.pts})</span><br>
                            <span>${mod.details}</span>
                        </div>
                    `;
                });
                pointCost += unit.mods.reduce((acc,cur)=>{return acc + cur.pts},0);
            }
            tabContentListHTML += `
                <li class="unit-list-item">
                    <span>${unit.quantity}x </span>
                    <span>${unit.unit.name} </span>
                    <span>${pointCost} Pts</span>
                    <div class="stats-grid">
                        <div class="grid-header">F</div>
                        <div class="grid-header">S</div>
                        <div class="grid-header">D</div>
                        <div class="grid-header">A</div>
                        <div class="grid-header">W</div>
                        <div class="grid-header">C</div>
                        <div class="grid-header">M / W / F</div>
                        <div class="grid-item">0 / -</div>
                        <div class="grid-item">0</div>
                        <div class="grid-item">0</div>
                        <div class="grid-item">0</div>
                        <div class="grid-item">0</div>
                        <div class="grid-item">0</div>
                        <div class="grid-item">0 / 0 / 0</div>
                    </div>
                    <div class="flex-col">${unitModsHTML}</div>
                </li>
            `;
        });
        tabContentHTML += `
            <div class="player-tab-content player-tab-content-${army.player}">
                <div>
                    <h3>${army.player}</h3>
                    <h5>${army.units.reduce((acc,cur)=>{return acc + cur.unit.pts + cur.mods.reduce((a,c)=>{return a + c.pts},0)},0)} Pts</h5>
                </div>
                <ul>
                    ${tabContentListHTML}
                </ul>
            </div>
        `;
        }
    });
    
    const el = document.getElementById('unitDisplayTabControl');
    if (el) {
        el.innerHTML = `
            <div class="player-tab-labels">${tabLabelHTML}</div>
            <div class="player-tab-container">${tabContentHTML}</div>
        `;
    }
    // //tabLabelEle.innerHTML = tabLabelHTML;
    // tabContentEle.innerHTML = tabContentHTML;
    // console.log(`tabLabelEle: ${tabLabelEle.innerHTML} \n ${tabLabelHTML}`);
    // console.log(`tabContentEle: ${tabContentEle.innerHTML} \n ${tabContentHTML}`);
    
    // if (tabLabelEle && tabContentEle) {
    //     tabLabelEle.innerHTML = tabLabelHTML;
    //     tabContentEle.innerHTML = tabContentHTML;
    // } else {
    //     console.error(`Couldnt find player-tab-labels or player-tab-container`);
    // }
}

function getModifiersForUnit(unit) {
    return unitmodifiers.filter(m => m.unitID === unit.unitID)
        .map( (x,i) => {
            return modifiers.find(m => m.modifierID === x.modifierID)
        })
}

function handleModToggle(event) {
    const btnEle = event.target.parentElement;
    const checkboxEle = btnEle.querySelector('input[type="checkbox"]');
    const oldState = checkboxEle.checked;
    checkboxEle.checked = !oldState;
    // Poll each mod that is shown to see if it is checked
    displayState.unitSelectionSelectedMods = [];
    const checkedCheckboxes = btnEle.parentElement.querySelectorAll('input[type="checkbox"]:checked');
    // For each checked checkbox, get the mod
    checkedCheckboxes.forEach(chk => {
        const checkedID = parseInt(chk.parentElement.getAttribute('key'));
        const checkedMod = modifiers.find(m => m.modifierID === checkedID);
        if (checkedMod) {
            displayState.unitSelectionSelectedMods.push(checkedMod);
        }
    });
    updateShownScore();
}

function updateShownScore() {
    if (displayState.unitSelectionSelectedUnit) {
        displayState.scoreSubtotal = displayState.unitSelectionSelectedUnit.pts;
    }
    if (displayState.unitSelectionSelectedMods && displayState.unitSelectionSelectedMods.length > 0) {
        displayState.scoreSubtotal += displayState.unitSelectionSelectedMods.reduce((acc,cur) => { return acc + cur.pts }, 0);
    }
    const elePts = document.getElementById('unitSelectionUnitPts');
    const eleQty = document.getElementById('unitSelectionQty');
    elePts.innerHTML = `${displayState.scoreSubtotal} Pts`;
    if (eleQty && displayState.selectionQuantity > 0) {
        // Then update the subtotal
        const eleUnitTotal = document.getElementById('unitSelectionSubtotal');
        if (eleUnitTotal) {
            eleUnitTotal.innerHTML = `${displayState.scoreSubtotal * displayState.selectionQuantity} Pts`;
        }
    }
}

function renderSelectedUnitDetails(tgt) {
    const eleName = document.getElementById('unitSelectionUnitName');
    const elePts = document.getElementById('unitSelectionUnitPts');
    const eleMods = eleName.parentElement.parentElement.querySelector('.unit-modifiers');
    const eleQty = document.getElementById('unitSelectionQty');
    const statsGrid = eleName.parentElement.parentElement.querySelector('.stats-grid');
    // get the unitID from selected item
    const clickedID = parseInt(tgt.options[tgt.selectedIndex].getAttribute('key'));
    if (!clickedID) {return;}
    // Find the unit associated with the clicked unitID
    const unit = units.find((u) => {return u.unitID === clickedID});
    const mods = getModifiersForUnit(unit);
    displayState.unitSelectionSelectedUnit = unit;
    displayState.unitSelectionShownMods = mods;
    displayState.scoreSubtotal = unit.pts;
    displayState.selectionQuantity = 1;
    eleName.setAttribute('key', unit.unitID);
    let modsHTML = '';
    mods.forEach( mod => {
        modsHTML += `
            <button class="mod-details" key="${mod.modifierID}" onclick="handleModToggle(event)">
                <input type="checkbox" class="" disabled />
                <span>${mod.name}</span>
                <span> ${mod.pts} Pts</span>
            </button>
        `;
    });
    eleName.innerHTML = `${unit.name}`;
    elePts.innerHTML = `${unit.pts} Pts`;
    eleQty.value = displayState.selectionQuantity;
    renderStatsGrid(statsGrid, unit)
    eleMods.innerHTML = modsHTML;
    updateShownScore();
}

function renderStatsGrid(statsGridEle, stats) {
    const gridItems = statsGridEle.children;
    if (gridItems.length != 14) { console.error('Stats grid has the wrong number of items. Check renderStatsGrid'); return;}
    gridItems[7].innerHTML = stats.ranged > 0 ? `${stats.melee} / ${stats.ranged}+` : `${stats.melee} / -`;
    gridItems[8].innerHTML =  `${stats.strength}`;
    gridItems[9].innerHTML =  `${stats.defence}`;
    gridItems[10].innerHTML = `${stats.attack}`;
    gridItems[11].innerHTML = `${stats.wounds}`;
    gridItems[12].innerHTML = `${stats.courage}`;
    gridItems[13].innerHTML = `${stats.might} / ${stats.will} / ${stats.fate}`;
}

function renderSelectionList(selectionEle, arrKeys, arrValues, showNum = 1) {
    let html = '';
    for(var i=0; i < arrKeys.length; i++) {
        html += `
            <option key="${arrKeys[i]}">
                <span>${arrValues[i]}</span>
            </option>
        `;
    }
    if (showNum != 1) {
        selectionEle.setAttribute('size', Math.min(arrKeys.length, showNum));
    }
    selectionEle.innerHTML = html;
}

function showCurrentTab() {
    const tabcontainer = document.querySelector('.tab-container');
    if (!tabcontainer) return;
    const tabs = tabcontainer.querySelectorAll('.tab');
    loadState();
    if (state.step > tabs.length) { console.error('Tried to select a nonexistent tab'); return; }
    tabs.forEach((tab) => {
        tab.classList.remove('active');
    });
    renderStep(state.step);
    tabs[state.step-1].classList.add('active');
} 

function changePlayerTab(event, playerName) {
    // Remove .active from all player tabs
    // Add .active to the player's tab It is the one with class player-tab-content-NAME
    const allTabs = event.target.parentElement.querySelectorAll(`.player-tab-content`);
    allTabs.forEach(tab => {
        console.log('removing active from tab: '+tab.outerHTML);
        tab.classList.remove('active');
        if (tab.classList.includes(`player-tab-content-${playerName}`)) {
            tab.classList.add('active');
        }
    });
    
}


function establishCallbacks() {
    // submit action of the playerNameForm
    document.getElementById('playerNameForm').addEventListener('submit', function (ev) {
        ev.preventDefault();
        const txt = document.getElementById('playerNameInput');
        addPlayer(txt.value);
        txt.value = "";
    });
    // Continue button
    document.querySelectorAll('.next-step-button').forEach((btn) => {
        btn.addEventListener('click', function (ev) {
            if (state.step < numTabs) {
                state.step += 1;
            }
            saveState();
            showCurrentTab();
        });
    });
    // Previous button
    document.querySelectorAll('.prev-step-button').forEach((btn) => {
        btn.addEventListener('click', function (ev) {
            if (state.step > 1) {
                state.step -= 1;
            }
            saveState();
            showCurrentTab();
        });
    });
    // Unit Selection filter input
    document.getElementById('unitSelectionSearch').addEventListener('keyup', (ev) => {
        const tok = ev.target.value;
        // Filter the <option> elements in the unitSelectionList <select> element
        const listEle = document.getElementById('unitSelectionList');
        listEle.querySelectorAll('option').forEach((option) => {
            if (option.getAttribute('key') === tok || 
                option.innerHTML.toUpperCase().indexOf(tok.toUpperCase()) > -1) {
                option.style.display = "block";
            } else {
                option.style.display = "none";
            }
        });
    });

    document.getElementById('unitSelectionList').addEventListener('change', (ev) => {
        renderSelectedUnitDetails(ev.target)
    });

    document.getElementById('unitSelectionQty').addEventListener('change', (ev) => {
        displayState.selectionQuantity = ev.target.value;
        updateShownScore();
    });

    document.getElementById('unitSelectionAddUnitButton').addEventListener('click', (ev) => {
        // Check that a unit is selected and a positive whole number quantity is used
        function isPositiveWholeNumber(x) {
            if (typeof x !== 'number') {return false}
            return x > 0 && Number.isInteger(x);
        }
        console.log(displayState);
        if (displayState.hasOwnProperty('unitSelectionSelectedUnit') && displayState.unitSelectionSelectedUnit
            && displayState.selectionQuantity && isPositiveWholeNumber(parseInt(displayState.selectionQuantity))) {
            // Add the selected unit to the data/cookie, and refresh the page
            if (!state.hasOwnProperty('armies')) {
                state.armies = [];
            }
            // If the player doesnt have an entry in armies, add one for them
            const playerName = document.getElementById('unitSelectionPlayer').value;
            let playerArmy = state.armies.find(a => {
                return (state.players.includes(playerName) && a.player === playerName);
            });
            if (!playerArmy) {
                playerArmy = {
                    player: playerName,
                    units: []
                };
                state.armies.push(playerArmy);
            }
            // Add the unit into the army
            playerArmy.units.push({
                unit: displayState.unitSelectionSelectedUnit,
                mods: (displayState.unitSelectionSelectedMods) ? displayState.unitSelectionSelectedMods : [],
                quantity: parseInt(displayState.selectionQuantity)
            });
            saveState();
            const armyDisplayEle = document.getElementById('unitDisplayTabControl');
            renderArmyDisplay(armyDisplayEle);
        }
    });
}
function loadState() {
    const cookie = getCookie('data');
    if (!cookie) {
        console.info('No state was loaded (There was no cookie called "data")');
        state = { step:1, players:[]};
        return;
    }
    state = JSON.parse(cookie);
}

function saveState() {
    setCookie('data',JSON.stringify(state));
}

function addPlayer(txt) {
    state.players = [...state.players, txt];
    setCookie('data', JSON.stringify(state));
    renderStep();
}

const tabcontainer = document.querySelector('.tab-container');
const numTabs = tabcontainer.querySelectorAll('.tab').length;

var state;
var displayState = {};
showCurrentTab();
establishCallbacks();