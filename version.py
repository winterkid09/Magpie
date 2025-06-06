import os
import json
import logging
import requests
import traceback

def getVersion():
    try:
        contents = None
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'version')
        with open(path, 'r') as reader:
            contents = reader.read().strip()

        if contents.isnumeric():
            return {
                'version': contents,
                'build': contents,
            }

        return json.loads(contents)
    except FileNotFoundError:
        logging.error(f'Error reading Magpie\'s version: file "version" not found')
    except Exception as e:
        logging.error(f'Error reading Magpie\'s version: {traceback.format_exc()}')

    return {
        "version": "Unknown",
        "build": "Unknown"
    }

def getRemoteVersion():
    try:
        request = requests.get('https://magpietracker.us/api/version')
        version = json.loads(request.text)

        if 'magpieDisplay' in version:
            version['magpie'] = { 'version': version['magpieDisplay'], 'build': version['magpie'] }
            del version['magpieDisplay']
        else:
            version['magpie'] = { 'version': version['magpie'], 'build': version['magpie'] }

        return version
    except:
        return None

def getAutotrackerVersion():
    try:
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'autotracker-version')
        with open(path, 'r') as reader:
            return reader.read().strip()
    except:
        return 'unknown'

def getUpdateMessage():
    try:
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'updateMessage')
        with open(path, 'r') as reader:
            return reader.read().strip()
    except:
        return None
