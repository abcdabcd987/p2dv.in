import pymongo

class Updater:
    def _initDB(self):
        client = pymongo.MongoClient('localhost', 27017)
        self.db = client['p2dvin'];

    def _updateUser(self):
        for user in self.db.users.find({}):
            submits = self.db.ais.find({'user':user['name']}).count()
            self.db.users.update({'_id':user['_id']}, {'$set': {'submit': submits}})

    def _updateAI(self):
        for ai in self.db.ais.find({}):
            ratio = ai['win']/float(ai['win']+ai['draw']+ai['lose'])
            self.db.ais.update({'_id':ai['_id']}, {'$set': {'ratio': ratio}})

    def Run(self):
        self._initDB()
        self._updateUser()
        self._updateAI()

updater = Updater()
updater.Run()
