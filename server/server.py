from __future__ import print_function
from googleapiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools
import flask
from flask import request, jsonify
from flask_cors import CORS
import pickle
import os.path
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

from datetime import datetime

# If modifying these scopes, delete the file token.pickle.
SHEET_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

DOOR_KNOCKING_SPREADSHEET_ID = '15NkVPeWOJvkDwY8tPCPhX16bDk9m2_TjU-ioGHa3LnY'
DOOR_KNOCKING_RANGE = 'Kontakt/samtaler!K2:M9'
FULL_RANGE = 'Kontakt/samtaler!A1:I100'

def setupSheetsService():
    store = file.Storage('token-sheets.json')
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets('credentials-sheets.json', SHEET_SCOPES)
        creds = tools.run_flow(flow, store)
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    return build('sheets', 'v4', credentials=creds)

def getDoorKnockingStats():
    service = setupSheetsService()
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=DOOR_KNOCKING_SPREADSHEET_ID,
                                range=DOOR_KNOCKING_RANGE).execute()
    return result.get('values')

def getFullDoorKnockingStats():
    service = setupSheetsService()
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=DOOR_KNOCKING_SPREADSHEET_ID,
                                range=FULL_RANGE).execute()
    return result.get('values')

if __name__ == '__main__':
    server = flask.Flask(__name__)
    CORS(server)
    server.config["DEBUG"] = True


    @server.route('/', methods=['GET'])
    def home():
        return "it works!"

    @server.route('/doors', methods=['GET'])
    def doorStats():
        return jsonify(getDoorKnockingStats())

    @server.route('/doors/extended', methods=['GET'])
    def fullDoorStats():
        return jsonify(getFullDoorKnockingStats())

    server.run(host='0.0.0.0')
