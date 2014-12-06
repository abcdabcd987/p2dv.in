import time
import json
import pymongo
import tempfile
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
            time.sleep(1)

    ###### Task 1: Unzip & Compile
    def _build(self, ai):
        print '========== Found AI to be build: <', ai['user'], ',', ai['idOfUser'], '>, upload date: ', ai['uploadDate']
        p = Prepare(ai).Run()

        if p['status'] == 'failure':
            self.db.ais.update({'_id':ai['_id']}, { '$set': {
                'status': 'Unavailable',
                'buildInfo': p['error']
            }})

        else:
            self.db.ais.update({'_id':ai['_id']}, { '$set': {
                'status': 'Available',
                'buildInfo': p['info'],
                'absPath': path.join(const.AI_SAVE_DIRECTORY, 'ai_' + str(ai['_id']))
            }})
        print '      Done!'


    ###### Task 2: Battle
    def _battle(self, battle):
        print '========== Found a battle: <', battle['user0'], ',', battle['idOfUser0'], '> vs <', battle['user1'], ', ', battle['idOfUser1'], '>'

        # Mark Running
        doc_rec = {'$set':{'status': 'Running'}}
        self.db.records.update({'_id':battle['_id']}, doc_rec)

        # Run battle
        server = const.AI_SERVER_DIRECTORY
        ai0 = self.db.ais.find_one({ 'user': battle['user0'], 'idOfUser': battle['idOfUser0'] })
        ai1 = self.db.ais.find_one({ 'user': battle['user1'], 'idOfUser': battle['idOfUser1'] })
        updater = lambda step: self.db.records.update({'_id':battle['_id']}, {'$set':{'step':step}})
        result = Battle(server, ai0, ai1, updater).Run()

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
            'runDate': datetime.utcnow()
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
        self.db.ais.update({'_id':ai0['_id']}, doc_ai0)
        self.db.ais.update({'_id':ai1['_id']}, doc_ai1)
        self.db.users.update({'name':ai0['user']}, doc_user0)
        if doc_user1:
            self.db.users.update({'name':ai1['user']}, doc_user1)
        self.db.records.update({'_id':battle['_id']}, doc_rec)

        print "      Done!"

daemon = Daemon()
daemon.Run()
