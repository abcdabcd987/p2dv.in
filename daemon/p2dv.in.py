import json
import pymongo
import tempfile
import subprocess
from os import path
from datetime import datetime

import const
from battle import Battle
from prepare import Prepare

class Daemon:
    def _initDB(self):
        client = pymongo.MongoClient('localhost', 27017)
        self.db = client['p2dvin'];

    def Run(self):
        self._initDB();
        while True:
            for ai in self.db.ais.find({ 'status': 'Pending' }).sort('_id', 1):
                self._build(ai)
            for battle in self.db.records.find({ 'status': 'Pending' }).sort('_id', 1):
                self._battle(battle)

    ###### Task 1: Unzip & Compile
    def _addTask(self, ai0):
        print '      Arranging battles for the AI...'
        tasks = []
        for ai1 in self.db.ais.find({ 'status': 'Available' }).sort('_id', -1):
            info = {
                'user0'     : ai0['user'],
                'name0'     : '',
                'idOfUser0' : ai0['idOfUser'],
                'user1'     : ai1['user'],
                'name1'     : '',
                'idOfUser1' : ai1['idOfUser'],
                'status'    : 'Pending',
                'step'      : 0,
                'result'    : -1,
                'winnerId'  : '',
                'loserId'   : '',
                'ids'       : list(),
                'winner'    : {},
                'loser'     : {},
                'log'       : '',
                'submitDate': datetime.now(),
                'runDate'   : datetime.now()
            }
            tasks.append(info)
        if tasks:
            self.db.records.insert(tasks)

    def _build(self, ai):
        print '========== Found AI to be build: <', ai['user'], ',', ai['idOfUser'], '>, upload date: ', ai['uploadDate']

        p = Prepare(ai).Run()

        if p['status'] == 'failure':
            self.db.ais.update({'_id':ai['_id']}, { '$set': {
                'status': 'Unavailable',
                'buildInfo': p['error']
            }})

        else:
            self._addTask(ai)
            self.db.ais.update({'_id':ai['_id']}, { '$set': {
                'status': 'Available',
                'buildInfo': p['info'],
                'absPath': path.join(const.AI_SAVE_DIRECTORY, 'ai_' + str(ai['_id']))
            }})


    ###### Task 2: Battle
    def _battle(self, battle):
        print '========== Found a battle: <', battle['user0'], ',', battle['idOfUser0'], '> vs <', battle['user1'], ', ', battle['idOfUser1'], '>'
        # Run battle
        server = const.AI_SERVER_DIRECTORY
        ai0 = self.db.ais.find_one({ 'user': battle['user0'], 'idOfUser': battle['idOfUser0'] })
        ai1 = self.db.ais.find_one({ 'user': battle['user1'], 'idOfUser': battle['idOfUser1'] })
        result = Battle(server, ai0, ai1).Run()

        # Prepare documents
        doc_ai0 = {'$set':{'name':result['user'][0]}}
        doc_ai1 = {'$set':{'name':result['user'][1]}}
        doc_rec = {'$set':{
            'name0'  : result['user'][0],
            'name1'  : result['user'][1],
            'step'   : result['total'],
            'status' : 'Finished',
            'ids'    : [ai0['_id'], ai1['_id']],
            'result' : result['result'],
            'log'    : json.dumps(result, indent=2),
            'runDate': datetime.now()
        }}
        if result == 2:
            # if draw
            doc_ai0['$inc'] = {'draw':1}
            doc_ai1['$inc'] = {'draw':1}
        elif result == 1:
            # if ai1 won:
            doc_ai0['$inc'] = {'lose':1}
            doc_ai1['$inc'] = {'win' :1}
            doc_rec['$set']['winnerId'] = ai1['_id']
            doc_rec['$set']['loserId']  = ai0['_id']
            doc_rec['$set']['winner'] = { 'name': ai1['name'], 'user': ai1['user'], 'idOfUser': ai1['idOfUser'] }
            doc_rec['$set']['loser']  = { 'name': ai0['name'], 'user': ai0['user'], 'idOfUser': ai0['idOfUser'] }
        else:
            # if ai0 won:
            doc_ai0['$inc'] = {'win' :1}
            doc_ai1['$inc'] = {'lose':1}
            doc_rec['$set']['winnerId'] = ai0['_id']
            doc_rec['$set']['loserId']  = ai1['_id']
            doc_rec['$set']['winner'] = { 'name': ai0['name'], 'user': ai0['user'], 'idOfUser': ai0['idOfUser'] }
            doc_rec['$set']['loser']  = { 'name': ai1['name'], 'user': ai1['user'], 'idOfUser': ai1['idOfUser'] }

        # Update documents
        self.db.ais.update({'_id':ai0['_id']}, doc_ai0)
        self.db.ais.update({'_id':ai1['_id']}, doc_ai1)
        self.db.records.update({'_id':battle['_id']}, doc_rec)

daemon = Daemon()
daemon.Run()