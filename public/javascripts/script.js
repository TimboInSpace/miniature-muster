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
            break;
        case 3: 
            currentTab.querySelector('.next-step-button').disabled = true;
            break;
        default:
            break;
    }
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
    const cookieJsonObject = JSON.parse(getCookie("data"));
    state = cookieJsonObject?.state;
}

showCurrentTab();
establishCallbacks();