import pymongo

class Updater:
    def _initDB(self):
        client = pymongo.MongoClient('localhost', 27017)
        self.db = client['p2dvin'];

    def _updateUser(self):
        for user in self.db.users.find({}):
            submits = 0
            win = 0
            draw = 0
            lose = 0
            for ai in self.db.ais.find({'user':user['name']}):
                submits += 1
                win += ai['win']
                draw += ai['draw']
                lose += ai['lose']
            self.db.users.update({'_id':user['_id']}, {'$set': {'submit': submits, 'win': win, 'draw': draw, 'lose': lose}})

    def _updateAI(self):
        for ai in self.db.ais.find({}):
            cnt = ai['win']+ai['draw']+ai['lose']
            ratio = ai['win']/float(cnt) if cnt != 0 else 0
            self.db.ais.update({'_id':ai['_id']}, {'$set': {'ratio': ratio}})

    def Run(self):
        self._initDB()
        self._updateUser()
        self._updateAI()

updater = Updater()
updater.Run()
