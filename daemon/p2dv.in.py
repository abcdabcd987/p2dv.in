import time
import json
import random
import requests
import tempfile
from os import path
from bson import json_util
from datetime import datetime

import const
from battle import Battle
from prepare import Prepare

def toJSON(data):
    return json.dumps(data, default=json_util.default)

def loadJSON(data):
    return json.loads(data, object_hook=json_util.object_hook)

class Daemon:
    def _getTask(self):
        try:
            r = requests.post(const.CORE_SERVER + '/task', data={'token': const.TOKEN})
            return loadJSON(r.content)
        except:
            return {'type': 'empty'}

    def _findOne(self, collection, where):
        while True:
            try:
                r = requests.post(const.CORE_SERVER + '/find_one', data={'token': const.TOKEN, 'collection': collection, 'where': toJSON(where)})
                return loadJSON(r.content)
            except:
                print '_findOne fail.'
                time.sleep(random.random())

    def _getFile(self, ID, dlType, savepath):
        while True:
            try:
                r = requests.post(const.CORE_SERVER + '/download', data={'token': const.TOKEN, 'id': ID, 'type': dlType})
                with open(savepath, 'wb') as f:
                    f.write(r.content)
                return
            except:
                print '_getFile fail. id: %s, type: %s, response: %s' % (ID, dlType, r.content)
                time.sleep(random.random())

    def _uploadAI(self, ID, status, buildInfo, absPath=None):
        while True:
            try:
                data = { 'info': buildInfo, 'status': status, 'token': const.TOKEN, 'id': ID }
                if status == 'Available':
                    files = {'ai': open(absPath, 'rb')}
                else:
                    files = None
                r = requests.post(const.CORE_SERVER + '/upload', data=data, files=files)
                return r.json()
            except:
                print '_uploadAI fail. response: %s' % r.content
                time.sleep(random.random())

    def _updateDBs(self, data):
        while True:
            try:
                r = requests.post(const.CORE_SERVER + '/update', data={'data': toJSON(data), 'token': const.TOKEN})
                return r.json()
            except:
                print '_updateDBs fail. response: %s' % r.content
                time.sleep(random.random())

    def _updateDB(self, collection, where, value):
        return self._updateDBs({collection: [{'where': where, 'value': value}]})

    def Run(self):
        while True:
            task = self._getTask()
            if task['type'] == 'ai':
                self._build(task['doc'])
            elif task['type'] == 'battle':
                self._battle(task['doc'])
            else:
                time.sleep(1)

    ###### Task 1: Unzip & Compile
    def _build(self, ai):
        print '========== Found AI to be build: <', ai['user'], ',', ai['idOfUser'], '>, upload date: ', ai['uploadDate']
        self._ensureFile(str(ai['_id']), 'zip', ai['absPath'])
        p = Prepare(ai).Run()

        ID = str(ai['_id'])
        if p['status'] == 'failure':
            status = 'Unavailable'
            info = p['error']
        else:
            status = 'Available'
            info = p['info']
        self._uploadAI(ID, status, info, path.join(const.AI_SAVE_DIRECTORY, 'ai_' + ID))
        print '      Done!'


    ###### Task 2: Battle
    def _ensureFile(self, ID, fileType, absPath):
        if not path.isfile(absPath):
            self._getFile(ID, fileType, absPath)

    def _battle(self, battle):
        print '========== Found a battle: <', battle['user0'], ',', battle['idOfUser0'], '> vs <', battle['user1'], ', ', battle['idOfUser1'], '>'

        # Mark Running
        doc_rec = {'$set':{'status': 'Running'}}
        self._updateDB('records', {'_id':battle['_id']}, doc_rec)

        # Run battle
        server = const.AI_SERVER_DIRECTORY
        ai0 = self._findOne('ais', { 'user': battle['user0'], 'idOfUser': battle['idOfUser0'] })
        ai1 = self._findOne('ais', { 'user': battle['user1'], 'idOfUser': battle['idOfUser1'] })
        updater = lambda step: self._updateDB('records', {'_id':battle['_id']}, {'$set':{'step':step}})

        # Ensure executable file
        self._ensureFile(str(ai0['_id']), 'ai', ai0['absPath'])
        self._ensureFile(str(ai1['_id']), 'ai', ai1['absPath'])

        # Run battle
        result, stderr0, stderr1 = Battle(server, ai0, ai1, updater).Run()

        # Prepare documents
        doc_ai0 = {'$set':{'name':result['user'][0]}}
        doc_ai1 = {'$set':{'name':result['user'][1]}}
        doc_rec = {'$set':{
            'name0'  : result['user'][0],
            'name1'  : result['user'][1],
            'step'   : result['total'],
            'status' : 'Finished',
            'result' : result['result'],
            'log'    : json.dumps(result, indent=2),
            'runDate': datetime.utcnow(),
            'stderr0': stderr0,
            'stderr1': stderr1
        }}
        doc_user0 = {'$inc': dict()}
        doc_user1 = {'$inc': dict()}
        if result['result'] == 2:
            # if draw
            doc_ai0['$inc'] = {'draw':1}
            doc_ai0['$set']['ratio'] = (ai0['win'])/float(ai0['win']+ai0['draw']+ai0['lose']+1)
            doc_user0['$inc']['draw'] = 1
            if ai0['user'] != ai1['user']:
                doc_user1['$inc']['draw'] = 1
                doc_ai1['$set']['ratio'] = (ai1['win'])/float(ai1['win']+ai1['draw']+ai1['lose']+1)
                doc_ai1['$inc'] = {'draw':1}
            else:
                doc_user1 = None;
        elif result['result'] == 1:
            # if ai1 won:
            doc_ai0['$inc'] = {'lose':1}
            doc_ai1['$inc'] = {'win' :1}
            if ai0['user'] != ai1['user']:
                cnt0 = float(ai0['win']+ai0['draw']+ai0['lose']+1)
                cnt1 = float(ai1['win']+ai1['draw']+ai1['lose']+1)
            else:
                cnt0 = float(ai0['win']+ai0['draw']+ai0['lose']+2)
                cnt1 = float(ai1['win']+ai1['draw']+ai1['lose']+2)
            doc_ai0['$set']['ratio'] = (ai0['win'])/cnt0
            doc_ai1['$set']['ratio'] = (ai1['win']+1)/cnt1
            doc_user0['$inc']['lose'] = 1;
            doc_user1['$inc']['win' ] = 1;
            doc_rec['$set']['winnerId'] = ai1['_id']
            doc_rec['$set']['loserId']  = ai0['_id']
            doc_rec['$set']['winner'] = { 'name': ai1['name'], 'user': ai1['user'], 'idOfUser': ai1['idOfUser'] }
            doc_rec['$set']['loser']  = { 'name': ai0['name'], 'user': ai0['user'], 'idOfUser': ai0['idOfUser'] }
        elif result['result'] == 0:
            # if ai0 won:
            doc_ai0['$inc'] = {'win' :1}
            doc_ai1['$inc'] = {'lose':1}
            if ai0['user'] != ai1['user']:
                cnt0 = float(ai0['win']+ai0['draw']+ai0['lose']+1)
                cnt1 = float(ai1['win']+ai1['draw']+ai1['lose']+1)
            else:
                cnt0 = float(ai0['win']+ai0['draw']+ai0['lose']+2)
                cnt1 = float(ai1['win']+ai1['draw']+ai1['lose']+2)
            doc_ai0['$set']['ratio'] = (ai0['win']+1)/cnt0
            doc_ai1['$set']['ratio'] = (ai1['win'])/cnt1
            doc_user0['$inc']['win' ] = 1;
            doc_user1['$inc']['lose'] = 1;
            doc_rec['$set']['winnerId'] = ai0['_id']
            doc_rec['$set']['loserId']  = ai1['_id']
            doc_rec['$set']['winner'] = { 'name': ai0['name'], 'user': ai0['user'], 'idOfUser': ai0['idOfUser'] }
            doc_rec['$set']['loser']  = { 'name': ai1['name'], 'user': ai1['user'], 'idOfUser': ai1['idOfUser'] }
        else:
            print "!!!!!!!! UNKNOWN RESULT !!!!!!!!"

        # Update documents
        docs = { 'ais': [], 'users': [], 'records': [] }
        docs['ais'].append({'where': {'_id':ai0['_id']}, 'value': doc_ai0})
        docs['ais'].append({'where': {'_id':ai1['_id']}, 'value': doc_ai1})
        docs['users'].append({'where': {'name':ai0['user']}, 'value': doc_user0})
        if doc_user1:
            docs['users'].append({'where': {'name':ai1['user']}, 'value': doc_user1})
        docs['records'].append({'where': {'_id':battle['_id']}, 'value': doc_rec})
        self._updateDBs(docs)

        print "      Done!"

daemon = Daemon()
daemon.Run()
