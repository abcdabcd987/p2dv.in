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

        self.db.updater.insert({'id': ObjectId('000000000000000000000000'), 'type': 'user'})
        self.db.updater.insert({'id': ObjectId('000000000000000000000000'), 'type': 'ai'})

    def _updateAIRating(self, timestamp):
        lastid = self.db.updater.find_one({'type': 'ai'})['id']
        nowid = lastid
        (cnt0, cnt1) = (0, 0)
        ratingList = dict()

        for rec in self.db.records.find({'_id': {'$gt': lastid}}).sort('_id', 1):
            if time.mktime(rec['runDate'].timetuple()) > timestamp:
                break
            if rec['status'] != 'Finished':
                break
            nowid = rec['_id']
            if rec['ids'][0] == rec['ids'][1]:
                continue
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
                ratingList[str(rec['ids'][0])] = r0
                cnt0 += 1
            if r1 != R1:
                self.db.ais.update({'_id':rec['ids'][1]}, {'$set': {'rating':r1}})
                ratingList[str(rec['ids'][1])] = r1
                cnt0 += 1

        dt = datetime.fromtimestamp(timestamp)
        for aid in ratingList:
            self.db.airatings.insert({'id': ObjectId(aid), 'rating': ratingList[aid], 'date': dt})
            cnt1 += 1
        self.db.updater.update({'type': 'ai'}, {'$set': {'id': nowid}})
        return (cnt0, cnt1)

    def _updateUserRating(self, timestamp):
        lastid = self.db.updater.find_one({'type': 'user'})['id']
        nowid = lastid
        (cnt0, cnt1) = (0, 0)
        ratingList = dict()

        for rec in self.db.records.find({'_id': {'$gt': lastid}}).sort('_id', 1):
            if time.mktime(rec['runDate'].timetuple()) > timestamp:
                break
            if rec['status'] != 'Finished':
                break
            nowid = rec['_id']
            if rec['user0'] == rec['user1']:
                continue
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
                ratingList[rec['user0']] = r0
                cnt0 += 1
            if r1 != R1:
                self.db.users.update({'name':rec['user1']}, {'$set': {'rating':r1}})
                ratingList[rec['user1']] = r1
                cnt0 += 1

        dt = datetime.fromtimestamp(timestamp)
        for uname in ratingList:
            udoc = self.db.users.find_one({'name': uname})
            self.db.userratings.insert({'id': udoc['_id'], 'rating': ratingList[uname], 'date': dt})
            cnt1 += 1
        self.db.updater.update({'type': 'user'}, {'$set': {'id': nowid}})
        return (cnt0, cnt1)

    def Run(self):
        self._initDB()
        self._setupRatings()

        timestamp = 1416568800
        while timestamp < time.time():
            res1 = self._updateAIRating(timestamp)
            res2 = self._updateUserRating(timestamp)
            print datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S'), res1, res2
            timestamp += 120


updater = Updater()
updater.Run()
