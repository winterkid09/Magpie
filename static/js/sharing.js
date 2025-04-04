"use strict"

function shareState() {
    liveUpdate = document.getElementById('liveUpdate').checked;
    localSettings.playerName = document.getElementById('playerName').value;
    localSettings.eventName = document.getElementById('eventName').value;
    localSettings.joinCode = document.getElementById('joinCode')?.value;

    saveSettingsToStorage(args, localSettings);

    sendState();
    sendLocation();
}

function sendState() {
    if (!localSettings.playerName) {
        return;
    }

    let state = getState();

    delete state.errorLog;

    $.ajax({
        type: "POST",
        url: sharingUrlApiPrefix() + "/api/playerState",
        contentType: "application/json",
        data: JSON.stringify(state),
        success: () => {
            let status = liveUpdate ? 'on' : 'off';
            document.getElementById('liveUpdateIcon').setAttribute('data-status', status);
        },
        error: (request) => {
            document.getElementById('liveUpdateIcon').setAttribute('data-status', 'error');
            console.log(request.responseText);
        }
    });
}

let shareTimeout = null;
function sharingLiveUpdate() {
    if (shareTimeout) {
        clearTimeout(shareTimeout);
    }

    if (!liveUpdate) {
        return;
    }

    shareTimeout = setTimeout(sendState, 250);
}

function sharingLiveUpdateLocation() {
    if (!liveUpdate || !localSettings.playerName) {
        return;
    }

    sendLocation();
}

let locationTimestamp = Date.now();
function sendLocation() {
    let data = {
        playerName: localSettings.playerName,
        sessionId: localSettings.sessionId,
        history: locationHistory.filter(x => x.timestamp > locationTimestamp),
    };

    if (!data.history.length) {
        return;
    }

    locationTimestamp = Date.now();

    $.ajax({
        type: "POST",
        url: sharingUrlApiPrefix() + "/api/playerLocation",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: () => {
            let status = liveUpdate ? 'on' : 'off';
            document.getElementById('liveUpdateIcon').setAttribute('data-status', status);
        },
        error: (request) => {
            document.getElementById('liveUpdateIcon').setAttribute('data-status', 'error');
            console.log(request.responseText);
        }
    });
}

function prepShareModal() {
    document.getElementById('playerName').value = localSettings.playerName;
    document.getElementById('eventName').value = localSettings.eventName;

    let joinCode = document.getElementById('joinCode');
    if (joinCode) {
        joinCode.value = localSettings.joinCode ?? '';
    }
}

function checkPlayerId() {
    $.ajax({
        type: "POST",
        url: sharingUrlApiPrefix() + "/api/playerId",
        data: {
            'playerName': document.getElementById('playerName').value
        },
        success: (response) => {
            setElementHidden(document.getElementById('playerIdWarning'),
                             response == 'None' || response == localSettings.playerId);
        }
    });

    playerIdTimeout = null;
}

var playerIdTimeout = null;
var eventInfoTimeout = null;
function updateShareUrls() {
    // let playerUrl = document.getElementById('playerUrl');
    let eventUrl = document.getElementById('eventUrl');
    // let playerName = document.getElementById('playerName').value;
    let eventName = document.getElementById('eventName').value;

    // playerUrl.href = `/player?playerName=${playerName}`;
    // playerUrl.innerHTML = playerUrl.href;
    eventUrl.href = sharingUrlPrefix() + `/event?eventName=${encodeURIComponent(eventName)}`;
    eventUrl.innerHTML = eventUrl.href;

    // setElementHidden(document.getElementById('playerLink'), !playerName);
    setElementHidden(document.getElementById('eventLink'), !eventName);

    if (playerIdTimeout) {
        clearTimeout(playerIdTimeout);
    }

    playerIdTimeout = setTimeout(checkPlayerId, 500);
    
    if (eventInfoTimeout) {
        clearTimeout(eventInfoTimeout);
    }

    eventInfoTimeout = setTimeout(() => {
        let eventBox = document.getElementById('eventName');

        if (!eventBox.value) {
            updateEventType();
            return;
        }

        $.ajax({
            type: "GET",
            url: sharingUrlApiPrefix() + "/api/eventInfo",
            data: { 'eventName': eventBox.value },
            success: (response) => {
                updateEventType(response);

                eventInfoTimeout = null;
            },
            error: (request, error, status) => {
                console.log(`Error getting event info: ${request.responseText}`);
                updateEventType(null, request.responseText);
                eventInfoTimeout = null;
            },
        });
    }, 500)
}

function updateEventType(eventInfo, error) {
    let joinCode = document.getElementById('joinCode');
    let joinLabel = document.querySelector('[for="joinCode"]');
    let joinAlert = document.getElementById('joinCodeAlert');
    let joinRequiredAlert = document.getElementById('joinRequiredAlert');
    let errorAlert = document.getElementById('shareErrorAlert');

    if (error) {
        errorAlert.innerHTML = error;
        setElementHidden(errorAlert, false);
        return;
    }
    else {
        errorAlert.innerHTML = '';
        setElementHidden(errorAlert, true);
    }

    if (!eventInfo || !eventInfo['privateJoin']) {
        setElementHidden(joinCode, true);
        setElementHidden(joinLabel, true);
        setElementHidden(joinAlert, true);
        setElementHidden(joinRequiredAlert, true);
    }
    else {
        setElementHidden(joinCode, false);
        setElementHidden(joinLabel, false);
        setElementHidden(joinRequiredAlert, false);
        setElementHidden(joinAlert, true);
    }
}

function liveUpdatePlayers() {
    if (players && players[0] == '') {
        return;
    }

    updatePlayerInventories();
    setTimeout(liveUpdatePlayers, 1000);
}

function updatePlayerInventories() {
    let activePlayers = [...document.querySelectorAll('input[data-player].update-input:checked')]
                                    .filter(x => x.offsetParent)
                                    .map(x => x.dataset.player);

    if (!activePlayers || !activePlayers.length) {
        return;
    }

    let data = {};

    for (const player of activePlayers) {
        let delaySeconds = [...document.querySelectorAll(`input[data-player="${player}"].delay-input`)]
                                       .filter(x => x.offsetParent)[0].value;
        data[player] = { 
            'timestamp': playerInventories[player].timestamp ?? 0 ,
            'delaySeconds': delaySeconds ?? 10,
        };
    }

    $.ajax({
        type: "GET",
        url: sharingUrlApiPrefix() + "/api/playerState",
        data: {
            players: JSON.stringify(data),
        },
        success: function(response) {
            if (!response) {
                return;
            }

            for (const player in response) {
                if (!response[player]) {
                    continue;
                }

                playerInventories[player] = JSON.parse(response[player].state).inventory;
                playerInventories[player].timestamp = response[player].timestamp;

                let time = " - " + new Date(Number(playerInventories[player].timestamp) * 1000).toLocaleTimeString();
                let elements = document.querySelectorAll(`[data-player="${player}"] .state-timestamp`);
                for (const element of elements) {
                    element.innerHTML = time;
                }
            }

            refreshImages();
        }
    });
}

function sharingUrlPrefix() {
    return local ? 'https://magpietracker.us' : '';
}

function sharingUrlApiPrefix() {
    return local ? 'https://magpietracker.us' : rootPrefix;
}

function eventAction() {
    let eventName = document.getElementById('eventName').value;
    let viewCode = document.getElementById('viewCode').value;
    let joinCode = document.getElementById('joinCode').value;
    let buttonAction = document.getElementById('eventActionButton').getAttribute('data-action');

    if (buttonAction == 'view') {
        location.href = sharingUrlPrefix() + `/event?eventName=${encodeURIComponent(eventName)}&viewCode=${encodeURIComponent(viewCode)}`;
    }
    else if (buttonAction == 'create') {
        $.ajax({
            type: "POST",
            url: sharingUrlApiPrefix() + "/api/createEvent",
            data: {
                'eventName': eventName,
                'joinCode': joinCode,
                'viewCode': viewCode,
            },
            success: (response) => {
                vueApp.updateEventInfo(eventName, viewCode);
            },
            error: (response, error, status) => {
                eventAlert.innerHTML = `Error creating event: ${response.responseText}`;
                setElementHidden(document.getElementById('eventAlert'), false);
            },
        });
    }
}

let eventFormTimeout = null;
function eventNameInput() {
    if (eventFormTimeout) {
        clearTimeout(eventFormTimeout);
    }

    if (!document.getElementById('eventName').value) {
        updateEventForm();
        return;
    }

    eventFormTimeout = setTimeout(() => {
        let eventBox = document.getElementById('eventName');

        $.ajax({
            type: "GET",
            url: sharingUrlApiPrefix() + "/api/eventInfo",
            // contentType: "application/json",
            data: {'eventName': eventBox.value },
            success: (response) => {
                updateEventForm(response);
            },
            error: (request, error, status) => {
                updateEventForm(null, request.responseText);
            },
        });
    }, 500)
}

function viewCodeInput() {
    let button = document.getElementById('eventActionButton');
    button.classList.add('btn-primary');
    button.classList.remove('btn-secondary');
    button.removeAttribute('disabled');
}

function updateEventForm(eventInfo, error) {
    let eventBox = document.getElementById('eventName');
    let eventAlert = document.getElementById('eventAlert');
    let codeFailedAlert = document.getElementById('codeFailedAlert');
    let viewLabel = document.querySelector('[for="viewCode"]');
    let viewBox = document.getElementById('viewCode');
    let joinLabel = document.querySelector('[for="joinCode"]');
    let joinBox = document.getElementById('joinCode');
    let button = document.getElementById('eventActionButton');
    let alertText = null;

    if (error) {
        alertText = `Error: ${error}`;
    }
    else if (!eventBox.value) {
        setElementHidden(eventAlert, true);
        setElementHidden(viewLabel, true);
        setElementHidden(viewBox, true);
        setElementHidden(joinLabel, true);
        setElementHidden(joinBox, true);
        button.setAttribute('disabled', '');
        button.setAttribute('data-action', 'create');
        button.innerHTML = 'Create Event';
    }
    else if(eventInfo) {
        setElementHidden(joinLabel, true);
        setElementHidden(joinBox, true);
        
        if (eventInfo.privateView) {
            setElementHidden(viewBox, false);
            setElementHidden(viewLabel, false);

            alertText = "Event exists and requires a code to view";
            button.innerHTML = "View Event";
            button.setAttribute('data-action', 'view');
            viewBox.setAttribute('placeholder', 'Required');

            if (viewBox.value) {
                button.removeAttribute('disabled');
            }
            else {
                button.setAttribute('disabled', '');
            }
        }
        else {
            setElementHidden(viewBox, true);
            setElementHidden(viewLabel, true);

            alertText = "Event exists and does not require a code to view";
            button.innerHTML = "View Event";
            button.setAttribute('data-action', 'view');
            button.removeAttribute('disabled');
        }
    }
    else {
        setElementHidden(viewBox, false);
        setElementHidden(viewLabel, false);
        setElementHidden(joinLabel, false);
        setElementHidden(joinBox, false);
        setElementHidden(joinBox, false);

        if (codeFailedAlert) {
            setElementHidden(codeFailedAlert, true);
        }

        alertText = "Event does not exist yet";
        button.innerHTML = "Create Event";
        button.removeAttribute('disabled');
        viewBox.setAttribute('placeholder', 'Optional');
        joinBox.setAttribute('placeholder', 'Optional');
    }

    if (alertText) {
        setElementHidden(eventAlert, false);
        eventAlert.innerHTML = alertText;
    }
    else {
        setElementHidden(eventAlert, true);
    }

    if (button.hasAttribute('disabled')) {
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
    }
    else {
        button.classList.add('btn-primary');
        button.classList.remove('btn-secondary');
    }
}