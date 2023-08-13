"use strict"

function drawActiveTab(updateNdi=true) {
    if (!allowMap) {
        return;
    }

    drawNodes(getActiveMap(), true, updateNdi);
}

function getActiveMap() {
    return getMapNameFromButton($('#mapContainer .tab-button.active button'));
}

function underworldActive() {
    return getActiveMap() == 'underworld';
}

function getMapNameFromButton(button) {
    return $(button).parent('li').attr('data-mapname')
}

function getButtonFromMapName(map) {
    return $(`li[data-mapname=${map}] button`)[0];
}

function pickingEntrances() {
    return graphicalMapSource != null;
}

function drawTab(button, clear=false) {
    if (clear) {
        removeNodes();
        closeAllTooltips();
    }

    let mapName = getMapNameFromButton(button);
    $('#mapContainer .tab.active').removeClass('active');
    $('#mapContainer .tab-button.active').removeClass('active');
    $(`#mapContainer .tab-button[data-mapname=${mapName}]`).addClass('active');
    $(`#mapContainer .tab [data-mapname=${mapName}]`).closest('.map-container').addClass('active');

    drawNodes(mapName, false);
}

function drawConnectorLines() {
    $('connection').connections('remove');
}

function getMapScaling(map) {
    let scaling = {};

    scaling.x = Math.min(1, $(map).width() / $(map).find('.map').prop('naturalWidth'));
    scaling.y = Math.min(1, $(map).height() / $(map).find('.map').prop('naturalHeight'));

    scaling.offset = {};

    scaling.offset.x = (16 * scaling.x - checkSize) / 2;
    scaling.offset.y = (16 * scaling.y - checkSize) / 2;

    return scaling;
}

function drawLocation() {
    let roomMap = mapFromRoom(currentRoom);
    let activeMap = getActiveMap();

    if ((roomMap != activeMap
         && (activeMap != 'overworld'
             || overworldRoom == null))
        || !localSettings.linkFace) {
        $('#linkFace').remove();
        return;
    }

    let mapContainer = $(`img[data-mapname=${activeMap}]`).closest('.map-container');
    let scaling = getMapScaling(mapContainer);

    let roomX;
    let roomY;
    
    if (activeMap == 'overworld') {
        let coords = overworldRoom.split('0x')[1];
        roomX = Number('0x' + coords[1]) * 162 + overworldX * 16;// + 72;
        roomY = Number('0x' + coords[0]) * 130 + overworldY * 16;// + 58;
    }
    else {
        if (!(currentRoom in roomDict)) {
            return;
        }

        let room = roomDict[currentRoom];
        roomX = room.x * 160 + currentX * 16;// + 72;
        roomY = room.y * 128 + currentY * 16;// + 58;

        if (activeMap == 'underworld') {
            roomX += 2 + room.x * 2;
            roomY += 2 + room.y * 2;
        }
    }

    let linkFace = $('#linkFace');

    if (linkFace.length == 0) {
        linkFace = $('<img>', {
            'id': 'linkFace',
            'draggable': false,
        });

        $(mapContainer).find('div.map-wrapper').append(linkFace);
    }

    linkFace.attr('src', `static/images${localSettings.graphicsPack}/linkface.png`);

    linkFace.css({
                'top': Math.round(roomY * scaling.y + scaling.offset.y),
                'left': Math.round(roomX * scaling.x + scaling.offset.x),
                'width': checkSize,
                'max-width': checkSize,
                'min-width': checkSize,
                'height': checkSize,
                'max-height': checkSize,
                'min-height': checkSize,
            });
}