import os
import json

class LocalSettings:
    def __init__(self):
        self.checkSize = 32
        self.mapBrightness = 50
        self.showOutOfLogic = False
        self.animateChecks = True
        self.swapMouseButtons = False
        self.swapItemsAndMap = False
        self.showChecked = True
        self.showHigherLogic = True
        self.showVanilla = True
        self.showVanillaEntrances = True
        self.showGoMode = True
        self.showLogicHints = True
        self.dungeonItemsTemplate = 'default.html'
        self.itemsTemplate = 'sevenbysix.html'
        self.customDungeonItems = None
        self.customItems = None
        self.showDungeonItemCount = False
        self.showItemsOnly = False
        self.highlightItemsOnHover = True
        self.ownedHighlight = 'bar'
        self.enableAutotracking = False
        self.autotrackItems = True
        self.autotrackChecks = True
        self.autotrackEntrances = True
        self.autotrackSettings = True
        self.autotrackSpoilers = True
        self.autotrackGraphicsPack = True
        self.autotrackerAddress = ''
        self.gps = True
        self.followMap = True
        self.followToUnderworld = "advanced"
        self.linkFace = True
        self.spoilOnCollect = False
        self.showOwnedPickups = False
        self.graphicsPack = ''
        self.broadcastItems = 'none'
        self.broadcastMap = 'none'
        self.stacked = False
        self.playerName = None
        self.eventName = None
        self.apServer = 'archipelago.gg:12345'
        self.apSlot = ''
        self.apPassword = ''
        self.exportAp = True
        self.exportTimestamp = True
        self.exportFilename = 'Magpie-state'

        self.diff0Color = '#0066ff'
        self.diff0VColor = '#ffffff'
        self.diff1Color = '#ffff00'
        self.diff1VColor = '#ffffff'
        self.diff2Color = '#ff8800'
        self.diff2VColor = '#ffffff'
        self.diff3Color = '#ff0000'
        self.diff3VColor = '#ffffff'
        self.diff8Color = '#0066ff'
        self.diff8VColor = '#ffffff'
        self.diff9Color = '#444444'
        self.diff9VColor = '#aaaaaa'
        self.diffCheckedColor = '#00ff00'
        self.diff0Alpha = 1
        self.diff0VAlpha = 1
        self.diff1Alpha = 1
        self.diff1VAlpha = 1
        self.diff2Alpha = 1
        self.diff2VAlpha = 1
        self.diff3Alpha = 1
        self.diff3VAlpha = 1
        self.diff8Alpha = 1
        self.diff8VAlpha = 1
        self.diff9Alpha = 1
        self.diff9VAlpha = 1
        self.diffCheckedAlpha = 1
        self.colorAssistMaps = False

        self.bgColor = '#212529'
        self.textColor = '#f8f9fa'
        self.highlightColor = '#444444'
    
    def parse(settingsString):
        localSettings = json.loads(settingsString)
        
        if 'py/object' in localSettings:
            del localSettings['py/object']

        obj = LocalSettings()
        obj.__dict__ = localSettings

        return obj
    
    def graphicsPacks():
        return ["Subrosian", "Mario", "Rooster", "Rosa", "Kirby", "Martha", "Meme", "Bunny", "Matty", "Bowwow", "Luigi", "Tarin", "AgesGirl", "Marin", "GrandmaUlrira", "Richard", "NESLink", "Ninten", "MarinAlpha", "X"]
        # gfxPath = 'LADXR/gfx/'

        # options = []

        # with os.scandir(gfxPath) as ls:
        #     for entry in ls:
        #         if entry.name.endswith('.bin') and entry.is_file():
        #             options.append(entry.name[:-4])
        
        # return options

nested = False

def settingsPath():
    return 'settings.json' if not nested else os.path.join('..', 'settings.json')

def updateSettings(argsText, settingsText, prefix=''):
    settings = readSettings()

    settings[prefix + 'args'] = argsText
    settings[prefix + 'localSettings'] = settingsText

    writeSettings(settings)

def writeSettings(settings):
    try:
        with open(settingsPath(), 'w') as file:
            file.write(json.dumps(settings))
    except Exception as e:
        print(f"Error writing settings: {e}")

def readSettings():
    try:
        with open(settingsPath(), 'r') as file:
            return json.loads(file.read())
    except Exception as e:
        print(f"Error reading settings, loading defaults: {e}")
        return defaultSettings()

def defaultSettings():
    return {
        'width': 1150,
        'height': 720,
    }