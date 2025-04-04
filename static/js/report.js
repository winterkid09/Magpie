"use strict"

async function sendSuggestion() {
    $.ajax({
        type: "POST",
        url: "https://dev.magpietracker.us/suggestion",
        data: {
            email: $('#suggestionEmail')[0].value,
            body: $('#bodyTextArea').summernote('code'),
            state: await getStateZip(),
        },
    });
}

async function sendError(payload, comments) {
    payload.userComments = comments;

    $.ajax({
        type: "POST",
        url: "https://dev.magpietracker.us/suggestion",
        data: {
            email: $('#errorEmail')[0].value,
            body: '<pre>' + JSON.stringify(payload, null, 3) + '</pre>',
            state: await getStateZip(),
        },
    });
}

async function getStateZip() {
    let state = getState();
    state.messageLog = messageLog;
    state.alertLog = alertLog;
    state.undos = getRecentUndos();
    state.spoilerLog = spoilerLog;
    state.locationHistory = locationHistory;

    state.undos.map(x => x.checkedChecks = [...x.checkedChecks]);

    return await zipString(JSON.stringify(state), `${(new Date()).toISOString().replaceAll(':', '_')}-magpie-state.json`);
}

async function zipString(string, filename) {
    var zip = new JSZip();
    zip.file(filename, string);
    return await zip.generateAsync({
        type: "base64",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    });
}

function getRecentUndos() {
    let undos = [];

    for (let i = undoStack.length - 1; i >= 0 && undos.length < 100; i--) {
        undos.push(undoStack[i]);
    }

    return undos;
}