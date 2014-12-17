#!/usr/bin/python2.7
import os
import sys
import time
import pymongo
from datetime import datetime
from bson.objectid import ObjectId

class Updater:
    def _initDB(self):
        client = pymongo.MongoClient('localhost', 27017, w=1)
        self.db = client['p2dvin']

    def _setupRatings(self):
        for ai in self.db.ais.find({}):
            self.db.ais.update({'_id': ai['_id']}, {'$set': {'rating': 1500}})
            self.db.airatings.insert({'id': ai['_id'], 'rating': 1500, 'date': ai['uploadDate']})

        for user in self.db.users.find({}):
            self.db.users.update({'_id': user['_id']}, {'$set': {'rating': 1500}})
            self.db.userratings.insert({'id': user['_id'], 'rating': 1500, 'date': user['registerDate']})

        self.db.updater.insert({'id': ObjectId('000000000000000000000000'), 'type': 'lastid'})
        self.db.updater.insert({'value': 1416568800, 'type': 'timestamp'})

    def _updateRating(self, timestamp):
        lastid = self.lastid
        nowid = lastid
        (cnt0, cnt1) = (0, 0)
        (cnt2, cnt3) = (0, 0)
        AIRatingList = dict()
        UserRatingList = dict()

        for self.lastrow in xrange(self.lastrow, len(self.records)):
            rec = self.records[self.lastrow]
            if time.mktime(rec['runDate'].timetuple()) > timestamp:
                break
            if rec['status'] != 'Finished':
                break
            nowid = rec['_id']

            if rec['ids'][0] != rec['ids'][1]:
                ai0 = self.db.ais.find_one({'_id':rec['ids'][0]})
                ai1 = self.db.ais.find_one({'_id':rec['ids'][1]})
                R0 = ai0['rating']
                R1 = ai1['rating']
                E0 = 1 / (1 + 10**((R1 - R0)/400))
                E1 = 1 / (1 + 10**((R0 - R1)/400))
                if rec['result'] == 0:
                    S0, S1 = 1, 0
                elif rec['result'] == 1:
                    S0, S1 = 0, 1
                else:
                    S0, S1 = 0.5, 0.5
                r0 = int(R0 + 42 * (S0 - E0))
                r1 = int(R1 + 42 * (S1 - E1))

                if r0 != R0:
                    self.db.ais.update({'_id':rec['ids'][0]}, {'$set': {'rating':r0}})
                    AIRatingList[str(rec['ids'][0])] = r0
                    cnt0 += 1
                if r1 != R1:
                    self.db.ais.update({'_id':rec['ids'][1]}, {'$set': {'rating':r1}})
                    AIRatingList[str(rec['ids'][1])] = r1
                    cnt0 += 1

            if rec['user0'] != rec['user1']:
                user0 = self.db.users.find_one({'name':rec['user0']})
                user1 = self.db.users.find_one({'name':rec['user1']})
                R0 = user0['rating']
                R1 = user1['rating']
                E0 = 1 / (1 + 10**((R1 - R0)/400))
                E1 = 1 / (1 + 10**((R0 - R1)/400))
                if rec['result'] == 0:
                    S0, S1 = 1, 0
                elif rec['result'] == 1:
                    S0, S1 = 0, 1
                else:
                    S0, S1 = 0.5, 0.5
                r0 = int(R0 + 16 * (S0 - E0))
                r1 = int(R1 + 16 * (S1 - E1))

                if r0 != R0:
                    self.db.users.update({'name':rec['user0']}, {'$set': {'rating':r0}})
                    UserRatingList[rec['user0']] = r0
                    cnt2 += 1
                if r1 != R1:
                    self.db.users.update({'name':rec['user1']}, {'$set': {'rating':r1}})
                    UserRatingList[rec['user1']] = r1
                    cnt2 += 1

        dt = datetime.fromtimestamp(timestamp)
        for aid in AIRatingList:
            self.db.airatings.insert({'id': ObjectId(aid), 'rating': AIRatingList[aid], 'date': dt})
            cnt1 += 1
        for uname in UserRatingList:
            self.db.userratings.insert({'id': self.userId[uname], 'rating': UserRatingList[uname], 'date': dt})
            cnt3 += 1
        self.lastid = nowid
        return ((cnt0, cnt1), (cnt2, cnt3))

    def Run(self):
        if os.path.isfile('/tmp/rating_updater.lock'):
            print 'Lock exist'
            return
        with open('/tmp/rating_updater.lock', 'w') as f:
            f.write(str(os.getpid()))

        self._initDB()
        if len(sys.argv) >= 2 and sys.argv[1] == 'init':
            self._setupRatings()

        self.lastid = self.db.updater.find_one({'type': 'lastid'})['id']
        self.userId = dict()
        for user in self.db.users.find({}):
            self.userId[user['name']] = user['_id']
        self.records = []
        timebound = time.mktime(datetime.utcnow().timetuple())
        self.lastrow = 0
        for rec in self.db.records.find({'_id': {'$gt': self.lastid}}, fields={'log':False,'stderr0':False,'stderr1':False}).sort('_id', 1):
            self.records.append(rec)

        timestamp = self.db.updater.find_one({'type': 'timestamp'})['value']
        lasttime = time.mktime(self.records[self.lastrow]['submitDate'].timetuple())
        while timestamp < timebound:
            if self.records[self.lastrow]['status'] != 'Finished':
                break
            if lasttime <= timestamp:
                res = self._updateRating(timestamp)
                if self.lastrow == len(self.records):
                    timebound = 0
                else:
                    lasttime = time.mktime(self.records[self.lastrow]['submitDate'].timetuple())
            else:
                res = None
            print datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S'), res
            timestamp += 120
        self.db.updater.update({'type': 'lastid'}, {'$set': {'id': self.lastid}})
        self.db.updater.update({'type': 'timestamp'}, {'$set': {'value': timestamp}})
        os.remove('/tmp/rating_updater.lock')


updater = Updater()
updater.Run()
