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
            console.log(units);
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
            break;
        case 3: 
            currentTab.querySelector('.next-step-button').disabled = true;
            break;
        default:
            break;
    }
}

function getModifiersForUnit(unit) {
    return unitmodifiers.filter(m => m.unitID === unit.unitID)
        .map( (x,i) => {
            return modifiers.find(m => m.modifierID === x.modifierID)
        })
}

function handleModToggle(event) {
    const btnEle = event.target.parentElement;
    const checkboxEle = btnEle.querySelector('.mod-details');
    console.log('Checkbox state:')
    console.log(checkboxEle.value);
}

function renderSelectedUnitDetails(tgt) {
    const eleName = document.getElementById('unitSelectionUnitName');
    const elePts = document.getElementById('unitSelectionUnitPts');
    const eleMods = eleName.parentElement.parentElement.querySelector('.unit-modifiers');
    const statsGrid = eleName.parentElement.parentElement.querySelector('.stats-grid');
    // get the unitID from selected item
    const clickedID = parseInt(tgt.options[tgt.selectedIndex].getAttribute('key'));
    if (!clickedID) {return;}
    const unit = units.find((u) => {return u.unitID === clickedID});

    const mods = getModifiersForUnit(unit);
    let modsHTML = '';
    mods.forEach( mod => {
        console.log(mod);
        modsHTML += `
            <button class="mod-details" key="${mod.modifierID}" onchange="handleModToggle(ev)">
                <input type="checkbox" class=""/>
                <span>${mod.name}</span>
                <span> ${mod.pts} Pts</span>
            </button>
        `;
    });
    
    eleName.innerHTML = `${unit.name}`;
    elePts.innerHTML = `${unit.pts} Pts`;
    renderStatsGrid(statsGrid, unit)
    eleMods.innerHTML = modsHTML;
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
    if (state.step > tabs.length) { console.error('Tried to select a nonexistent tab'); return; }
    tabs.forEach((tab) => {
        tab.classList.remove('active');
    });
    renderStep(state.step);
    tabs[state.step-1].classList.add('active');
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
            showCurrentTab();
        });
    });
    // Previous button
    document.querySelectorAll('.prev-step-button').forEach((btn) => {
        btn.addEventListener('click', function (ev) {
            if (state.step > 1) {
                state.step -= 1;
            }
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
}

function addPlayer(txt) {
    state.players = [...state.players, txt];
    setCookie('data', state);
    renderStep();
}

const tabcontainer = document.querySelector('.tab-container');
const numTabs = tabcontainer.querySelectorAll('.tab').length;

var state;
const cookie = getCookie("data");
if (!cookie) {
    state = { step:1, players:[]};
} else {
    console.log('This is the cookie');
    console.log(JSON.stringify(cookie, null, '  '));
    const cookieJsonObject = JSON.parse(cookie);
    state = cookieJsonObject?.state;
}

showCurrentTab();
establishCallbacks();