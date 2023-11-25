/*
the state / 'data' cookie ends up holding a structure like this:
{
    step: 2,
    players: ["Tim", "Brad"],
    armies: [
        {
            player: "Tim"
            units: [
                {
                    unit: ##unit##
                    quantity: 3,
                    mods: [
                        ##MOD##
                    ]
                }
            ]
        }
    ]
}
*/
// Ex. requiredRollForWound = woundData[strength][defence];
var woundData = [
    //1    2    3    4    5    6      7      8      9      10
    ['4', '5', '5', '6', '6', '6/4', '6/5', '6/6', '-',   '-'  ],       // 1
    ['4', '4', '5', '5', '6', '6',   '6/4', '6/5', '6/6', '-'  ],       // 2
    ['3', '4', '4', '5', '5', '6',   '6',   '6/4', '6/5', '6/6'],       // 3
    ['3', '3', '4', '4', '5', '5',   '6',   '6',   '6/4', '6/5'],       // 4
    ['3', '3', '3', '4', '4', '5',   '5',   '6',   '6',   '6/5'],       // 5
    ['3', '3', '3', '3', '4', '4',   '5',   '5',   '6',   '6'  ],       // 6
    ['3', '3', '3', '3', '3', '4',   '4',   '5',   '5',   '6'  ],       // 7
    ['3', '3', '3', '3', '3', '3',   '4',   '4',   '5',   '5'  ],       // 8
    ['3', '3', '3', '3', '3', '3',   '3',   '4',   '4',   '5'  ],       // 9
    ['3', '3', '3', '3', '3', '3',   '3',   '3',   '4',   '4'  ],       // 10
]

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

function findParent(ele, selector) {
    // Recursively search for a parent element that matches the given CSS selector
    const curEle = ele;
    if (ele.matches(selector)) { return curEle }
    else {
        if (!ele.parentElement) {
            return null;
        } else {
            return findParent(ele.parentElement, selector);
        }
    }
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
            const panes = currentTab.querySelectorAll('.unit-compare-pane');
            panes.forEach( elePane => {
                const tabCtl = elePane.querySelector('.player-tab-control');
                renderArmyComparisonList(tabCtl);
            });
            const woundDiv = document.querySelector('.wound-chart');
            if (woundDiv) {
                woundDiv.innerHTML = renderWoundChart();
            }
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
        tabLabelHTML += `<a href='#' class="player-tab-label player-tab-label-${army.player}" onclick="handlePlayerTabClick(event,'${army.player}')">${army.player}</a>`;
        let tabContentListHTML = '';
        let totalPoints = 0;
        army.units.forEach((unit, idx)=> {
            // Collect the HTML for the modifiers
            let unitModsHTML = '';
            let pointCost = unit.unit.pts;
            if (unit.mods) {
                unit.mods.forEach(mod => {
                    unitModsHTML += `
                        <div class="unit-mod-display">
                            <span>${mod.name} (+${mod.pts})</span>
                            <span><em>${mod.details}</em></span>
                        </div>
                    `;
                });
                pointCost += unit.mods.reduce((acc,cur)=>{return acc + cur.pts},0);
            }
            tabContentListHTML += `
                <li class="unit-list-item" unitindex="${idx}">
                    <div class="flex-row">
                        <div>
                            <div class="flex-row unit-list-item-header">
                                <span>${unit.quantity}x </span>
                                <span style="flex-grow: 1;"><b>${unit.unit.name}</b></span>
                                <span>${pointCost} Pts</span>
                                <button class="remove-unit-button" onclick="handleRemoveUnitButtonClick(event, '${army.player}')"> X </button>
                            </div>
                            ${renderStatsGrid2(unit.unit)}
                            <div class="flex-col">${unitModsHTML}</div>
                        </div>
                    </div>
                </li>
            `;
            totalPoints += (pointCost * unit.quantity);
        });
        tabContentHTML += `
            <div class="player-tab-content player-tab-content-${army.player}" style="padding: 0.5rem;">
                <div class="flex-row">
                    <h3 style="flex-grow: 1;">${army.player}'s Army</h3>
                    <h3 style="flex-grow: 0;">${totalPoints} Pts</h5>
                </div>
                <ul class="unit-list">
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
}

// Make a tab-control with a tab for each player, to display the army
// ele is the div that contains the tab-labels and the tab-container.
// each page is a tab-content
function renderArmyComparisonList(ele) {
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
        tabLabelHTML += `<a href='#' class="player-tab-label player-tab-label-${army.player}" onclick="handlePlayerTabClick(event,'${army.player}')">${army.player}</a>`;
        let tabContentListHTML = '';
        let totalPoints = 0;
        army.units.forEach((unit, idx)=> {
            // Collect the HTML for the modifiers
            let unitModsHTML = '';
            let pointCost = unit.unit.pts;
            if (unit.mods) {
                // unit.mods.forEach(mod => {
                //     unitModsHTML += `
                //         <div class="unit-mod-display">
                //             <span>${mod.name} (+${mod.pts})</span>
                //             <span><em>${mod.details}</em></span>
                //         </div>
                //     `;
                // });
                pointCost += unit.mods.reduce((acc,cur)=>{return acc + cur.pts},0);
            }
            tabContentListHTML += `
                <li class="unit-list-item" unitindex="${idx}" onclick="handleUnitComparisonListClick(event,${idx},'${army.player}')">
                    <div class=flex-row">
                        <span class="unit-list-item-header" style="width: 10em; text-overflow: ellipsis;"><b>${unit.unit.name}</b></span>
                        <div class="stats-grid-container inline">
                            ${renderStatsGrid2(unit.unit, true)}
                        </div>
                    </div>
                    <div class="flex-col">${unitModsHTML}</div>
                </li>
            `;
            totalPoints += (pointCost * unit.quantity);
        });
        tabContentHTML += `
            <div class="player-tab-content player-tab-content-${army.player}" style="padding: 0.5rem;">
                <div class="flex-row">
                    <h3 style="flex-grow: 1;">${army.player}'s Army</h3>
                    <h3 style="flex-grow: 0;">${totalPoints} Pts</h5>
                </div>
                
                <div class="flex-row" style="padding: 0.5rem">
                    <span style="width: 10em; margin-left: 0.5rem;"></span>
                    <div class="stats-grid">
                        <div class="grid-header">F</div>
                        <div class="grid-header">S</div>
                        <div class="grid-header">D</div>
                        <div class="grid-header">A</div>
                        <div class="grid-header">W</div>
                        <div class="grid-header">C</div>
                        <div class="grid-header">M / W / F</div>
                    </div>
                </div>
                
    
                <ul class="unit-list">
                    ${tabContentListHTML}
                </ul>
            </div>
        `;
        }
    });
    ele.innerHTML = `
        <div class="player-tab-labels">${tabLabelHTML}</div>
        <div class="player-tab-container">${tabContentHTML}</div>
    `;
    if (displayState.attackerIndex == null) {
        displayState.attackerIndex = 0;
    }
}

function handleUnitComparisonListClick(event,idx,player) {
    // TODO: Swap this out for a lookup of the unit ID from the Units array
    const unit = state.armies.find(a => a.player === player)?.units[idx];
    if (!unit) {
        console.error(`attempted to look up invalid unit with index ${idx} and player ${player}`);
        return;
    }
    const totalStats = statsWithMods(unit);
    // Get a reference to the container holding all the controls that display details on the unit
    const unitComparePane = findParent(event.target, '.unit-compare-pane');
    // Highlight the clicked item
    const unitCompareList = findParent(event.target, '.unit-list');
    if (unitCompareList) {
        // Array.from(unitCompareList.children).forEach( li => {
        //     li.classList.remove('active');
        // });
        const mainTab = findParent(event.target, '.unit-compare-pane');
        if (mainTab) {
            Array.from(mainTab.querySelectorAll('.unit-list-item')).forEach( li => {
                li.classList.remove('active');
            })
        }
        try {
            unitCompareList.children[idx].classList.add('active');
        }
        catch {
            console.error(`Attempted to highlight nonexistent child item of unit-list in Step 3: (index: ${idx})`);
        }

    }
    // Find the elements in the Details section, and update them with the unit
    const unitCompareDetails = unitComparePane.querySelector('.unit-compare-details');
    if (unitCompareDetails) {
        const statsGrid = unitCompareDetails.querySelector('.stats-grid');
        
        if (statsGrid) {
            statsGrid.outerHTML = renderStatsGrid2(totalStats);
        }
        const unitHeader = unitCompareDetails.querySelector('.unit-header');
        if (unitHeader && unitHeader.children.length >= 2) {
            unitHeader.children[0].innerHTML = totalStats.name;
            unitHeader.children[1].innerHTML = `${totalStats.pts} Pts`;
        }
        const unitMods = unitCompareDetails.querySelector('.unit-modifiers');
        if (unitMods) {
            unitMods.innerHTML = unit.mods.reduce( (acc, mod) => {
                const html = `
                <div class="unit-mod-display">
                    <span>${mod.name} (+${mod.pts})</span>
                    <span><em>${mod.details}</em></span>
                </div>
                `;
                return acc + html
            }, '');
        }
    }
    // update the displayState
    // But first, is this the left or the right pane?
    const pane = findParent(event.target, '.unit-compare-pane');
    if (pane) {
        // i should be 0 for the left pane and 1 for the right pane
        const i = Array.from(pane.parentNode.children).indexOf(pane);
        displayState[`pane-${i}`] = {
            unitID: unit.unit.unitID,
            clickedStrength: totalStats.strength,
            clickedDefence: totalStats.defence,
            clickedFight: totalStats.melee,
            clickedRangedFight: totalStats.ranged,
            clickedRangedStrength: totalStats.rangedstrength
        };
        refreshOutcomes(i);
    } else { 
        console.error(`Couldn't find the ancestor pane element for the list click event`); 
    }
}

function refreshOutcomes(displayStateUpdatedIndex) {
    
    // Which side is attacking? Which is defending?
    if (displayState.attackerIndex == null) {
        displayState.attackerIndex = 0;
    }

    // Put the correct emoji into the correct role icon box
    const attackEmoji = '⚔️';
    const defendEmoji = '🛡️';
    const pane0Role = document.querySelector('.pane-0-role');
    const pane1Role = document.querySelector('.pane-1-role');
    if (pane0Role && pane1Role) {
        pane0Role.innerHTML = (displayState.attackerIndex === 0) ? attackEmoji : defendEmoji;
        pane1Role.innerHTML = (displayState.attackerIndex === 1) ? attackEmoji : defendEmoji;
    } else {
        console.log(`pane0 or pane1 not found...????`);
    }

    // refresh the wound chart and outcome displays
    const woundDiv = document.querySelector('.wound-chart');
    const attackerDisplayState = displayState[`pane-${displayState.attackerIndex}`];
    const defenderDisplayState = displayState[`pane-${toggle(displayState.attackerIndex)}`];
    if (attackerDisplayState && defenderDisplayState && woundDiv) {
        // Refresh the wound chart
        woundDiv.innerHTML = renderWoundChart(
            attackerDisplayState.clickedStrength,
            defenderDisplayState.clickedDefence,
        );
        // Refresh the "X to wound" boxes
        const outcomeMelee = document.querySelector('.outcome-melee');
        const outcomeRanged = document.querySelector('.outcome-ranged');
        if (outcomeMelee && outcomeRanged) {
            // Update the melee box
            const s = displayState[`pane-${displayState.attackerIndex}`].clickedStrength;
            const d = displayState[`pane-${toggle(displayState.attackerIndex)}`].clickedDefence;
            outcomeMelee.innerHTML = `
                <div class="outcome-icon">🗡️</div>
                <div class="outcome-value">
                    <span>${getWoundVal(s,d)}+</span>
                </div>
                <div class="outcome-label outcome-label-right">
                    <span>TO</span><br/>
                    <span>WOUND</span>
                </div>
            `;
            // Update the ranged box 
            const rf = displayState[`pane-${displayState.attackerIndex}`].clickedRangedFight;
            const rs = displayState[`pane-${displayState.attackerIndex}`].clickedRangedStrength;
            outcomeRanged.innerHTML = (!rs || rs === 0) ? '' : `
                <div class="outcome-icon">🏹</div>
                <div>
                    <div class="outcome-value">${rf}+</div>
                    <div class="outcome-label outcome-label-bottom">
                        TO HIT
                    </div>
                </div>
                <div>
                    <div class="outcome-value">${getWoundVal(rs,d)}+</div>
                    <div class="outcome-label outcome-label-bottom">
                        TO WOUND
                    </div>
                </div>
            `;
        }
    }
}
 
function toggle(x) {
    if (x === 0) { return 1;} 
    else { return 0;}
}

function handleComparisonRoleToggle(event) {
    if (displayState.attackerIndex == null) {
        displayState.attackerIndex = 0;
    } else {
        const newstate = toggle(displayState.attackerIndex);
        displayState.attackerIndex = newstate;
    }
    // Apply the slide animation to each, then remove it.
    const pane0Role = document.querySelector('.pane-0-role');
    const pane1Role = document.querySelector('.pane-1-role');
    pane0Role.classList.add('slide-to-right');
    pane1Role.classList.add('slide-to-left');
    setTimeout(() => {
        pane0Role.classList.remove('slide-to-right');
        pane1Role.classList.remove('slide-to-left');
    },250);
    refreshOutcomes(-1);
}

function statsWithMods(unit) {
    // TODO: Look up each mod by a modifierID instead of the mod itself by doing a .map() call
    // Then sum up each stat using a .reduce() call
    const statsObj = {name: unit.unit.name};
    const vars = ['melee', 'ranged', 'strength', 'defence', 'attack', 'wounds', 'courage', 'might', 'will', 'fate', 'pts', 'rangedstrength'];
    vars.forEach( stat => {
        statsObj[stat] = unit.unit[stat] + unit.mods.reduce((acc,cur)=>{return acc + cur[stat]},0);
    });
    return statsObj;
}

function getWoundVal(s,d) {
    if (!s || !d || s < 1 || s > woundData.length || woundData.length === 0
        || d < 1 || d > woundData[0].length) {
            return 0;
        }
    return woundData[s-1][d-1];
}

function renderWoundChart(str = 0, def = 0) {
    if (woundData.length < 10 || woundData[0].length < 10) {
        console.error('Invalid wound chart was provided');
        return 'INVALID WOUND CHART';
    }
    let woundChartHTML = '';
    for (let s = 1; s <= woundData.length; s++) {
        for (let d = 1; d <= woundData[0].length; d++) {
            const r = 2 + s;
            const c = 2 + d;
            const active = (s === str || d === def) ? 'active' : '';
            const intersection = (s === str && d === def) ? 'intersection' : '';
            woundChartHTML += `
                <div class="wound-val roll-val roll-${s}-${d} ${active} ${intersection} pulse-animation" style="grid-area: ${r} / ${c} / ${r} / ${c}">
                 ${getWoundVal(s,d)}
                </div>
            `;
        }
    }

    // Remove the pulse-animation from all .wound-val items after the timeout
    setTimeout(()=>{
        Array.from(document.querySelectorAll('.wound-val')).forEach(wv => {
            wv.classList.remove('pulse-animation');
        });
    }, 500);

    return `
            <div class="col-label" style="text-align: center; grid-area: 1 / 3 / 1 / 12">Defence</div>
            <div class="row-label" style="transform: rotate(270deg); transform-origin: 120% 15%; grid-area: 3 / 1 / 12 / 1">Strength</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 3 / 2 / 3">1</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 4 / 2 / 4">2</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 5 / 2 / 5">3</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 6 / 2 / 6">4</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 7 / 2 / 7">5</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 8 / 2 / 8">6</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 9 / 2 / 9">7</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 10 / 2 / 10">8</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 11 / 2 / 11">9</div>
            <div class="num-label col-num-label" style="grid-area: 2 / 12 / 2 / 12">10</div>
            <div class="num-label row-num-label" style="grid-area: 3 / 2 / 3 / 2">1</div>
            <div class="num-label row-num-label" style="grid-area: 4 / 2 / 4 / 2">2</div>
            <div class="num-label row-num-label" style="grid-area: 5 / 2 / 5 / 2">3</div>
            <div class="num-label row-num-label" style="grid-area: 6 / 2 / 6 / 2">4</div>
            <div class="num-label row-num-label" style="grid-area: 7 / 2 / 7 / 2">5</div>
            <div class="num-label row-num-label" style="grid-area: 8 / 2 / 8 / 2">6</div>
            <div class="num-label row-num-label" style="grid-area: 9 / 2 / 9 / 2">7</div>
            <div class="num-label row-num-label" style="grid-area: 10 / 2 / 10 / 2">8</div>
            <div class="num-label row-num-label" style="grid-area: 11 / 2 / 11 / 2">9</div>
            <div class="num-label row-num-label" style="grid-area: 12 / 2 / 12 / 2">10</div>
            ${woundChartHTML}
    `;
}

function handleRemoveUnitButtonClick(event, playerName) {
    const liEle = event.target.parentElement.parentElement.parentElement.parentElement;
    if (!liEle) {
        console.error('Could not find element holding unitindex for deleting this unit.');
        return;
    }
    console.log(event.target);
    const unitIdx = liEle.getAttribute('unitindex');
    if (!unitIdx) {
        console.error('Could not find index for unit to delete');
        return;
    }
    if (!state.armies) {
        console.error('state has no armies property. Could not delete unit');
        return;
    }
    const army = state.armies.find(army => army.player === playerName);
    if (army) {
        // Remove the unit at the index
        army.units.splice(unitIdx,1);
    }
    saveState();
    // re-render
    const armyDisplayEle = document.getElementById('unitDisplayTabControl');
    renderArmyDisplay(armyDisplayEle);
    activatePlayerTab(armyDisplayEle,army.player);
}

function getModifiersForUnit(unit) {
    return unitmodifiers.filter(m => m.unitID === unit.unitID)
        .map( (x,i) => {
            return modifiers.find(m => m.modifierID === x.modifierID)
        })
}

function handleModToggle(event) {
    let btnEle = event.target;
    if (event.target.tagName !== "BUTTON") {
        event.stopPropagation();
        btnEle = event.target.parentElement;
    }
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
    // tgt is the <select> element that becomes the unit selection list
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
                <input type="checkbox" class="" onclick="handleModToggle(event)" disabled />
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
    // Update an existing stats grid
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

function renderStatsGrid2(stats, minimal = false) {
    const header = minimal ? '' : `
        <div class="grid-header">F</div>
        <div class="grid-header">S</div>
        <div class="grid-header">D</div>
        <div class="grid-header">A</div>
        <div class="grid-header">W</div>
        <div class="grid-header">C</div>
        <div class="grid-header">M / W / F</div>
    `;
    return `
    <div class="stats-grid">
        ${header}
        <div class="grid-item">${stats.ranged > 0 ? stats.melee+" / "+stats.ranged+"+" : " "+stats.melee+" / -"}</div>
        <div class="grid-item">${stats.strength}</div>
        <div class="grid-item">${stats.defence}</div>
        <div class="grid-item">${stats.attack}</div>
        <div class="grid-item">${stats.wounds}</div>
        <div class="grid-item">${stats.courage}</div>
        <div class="grid-item">${stats.might} / ${stats.will} / ${stats.fate}</div>
    </div>
   `;
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

function handlePlayerTabClick(event, playerName) {
    const tabControl = event.target.parentElement.parentElement;
    activatePlayerTab(tabControl, playerName);
}

function activatePlayerTab(eleTabControl, player) {
    // Remove .active from all player tabs
    // Add .active to the player's tab It is the one with class player-tab-content-NAME
    const allTabs = eleTabControl.querySelectorAll(`.player-tab-content`);
    allTabs.forEach(tab => { tab.classList.remove('active'); });
    const tabToActivate = eleTabControl.querySelector(`.player-tab-content-${player}`);
    tabToActivate.classList.add('active');
    const allLabels = eleTabControl.querySelectorAll('.player-tab-label');
    allLabels.forEach(lbl => { lbl.classList.remove('active'); });
    const lblToActivate = eleTabControl.querySelector(`.player-tab-label-${player}`);
    lblToActivate.classList.add('active');
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
        // Fix deletion bug
        if (displayState.hasOwnProperty('unitSelectionSelectedUnit') && displayState.unitSelectionSelectedUnit && displayState.selectionQuantity && isPositiveWholeNumber(parseInt(displayState.selectionQuantity))) {
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
                    units: [] // an array of {unit, mods[], quantity}
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
            activatePlayerTab(armyDisplayEle,playerArmy.player);
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