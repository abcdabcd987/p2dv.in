#!/usr/bin/python2.7
import tornado.ioloop
import tornado.web
import pymongo
import threading
import time
import json
import random
import os
from bson import json_util
from bson.objectid import ObjectId

import const

client = pymongo.MongoClient('localhost', 27017)
db = client['p2dvin']
mutex = threading.Lock()

def toJSON(data):
    return json.dumps(data, default=json_util.default)

def loadJSON(data):
    return json.loads(data, object_hook=json_util.object_hook)

class TaskHandler(tornado.web.RequestHandler):
    def post(self):
        token = self.get_body_argument('token', default='')
        if token != const.TOKEN:
            self.send_error()
            return

        while not mutex.acquire():
            time.sleep(random.random())
        self.set_header('Content-Type', 'application/json')

        doc = db.ais.find_and_modify({'status':'Pending'}, update={'$set':{'status':'Building'}}, sort=[('_id',1)])
        if doc:
            self.write(toJSON({ 'type': 'ai', 'doc': doc }))
            mutex.release()
            return

        doc = db.records.find_and_modify({'status':'Pending'}, update={'$set':{'status':'Running'}}, sort=[('_id', 1)])
        if doc:
            self.write(toJSON({ 'type': 'battle', 'doc': doc }))
            mutex.release()
            return

        self.write({ 'type': 'empty' })
        mutex.release()



class FindOneHandler(tornado.web.RequestHandler):
    def post(self):
        token = self.get_body_argument('token', default='')
        if token != const.TOKEN:
            self.send_error()
            return

        c = self.get_body_argument('collection', default='')
        w = self.get_body_argument('where', default='')
        doc = db[c].find_one(loadJSON(w))
        self.set_header('Content-Type', 'application/json')
        self.write(toJSON(doc))


class DownloadHandler(tornado.web.RequestHandler):
    def post(self):
        token = self.get_body_argument('token', default='')
        if token != const.TOKEN:
            self.send_error()
            return

        t = self.get_body_argument('type', default='')
        i = self.get_body_argument('id', default='')
        path = ''
        doc = db.ais.find_one({'_id':ObjectId(i)})
        if t == 'zip':
            if doc and doc['status'] == 'Building':
                path = doc['absPath']
        elif t == 'ai':
            if doc and doc['status'] == 'Available':
                path = doc['absPath']

        if path:
            self.set_header('Content-Type', 'application/octet-stream')
            with open(path, 'rb') as f:
                self.write(f.read())
            self.finish()
            return

        self.send_error()


class UploadHandler(tornado.web.RequestHandler):
    def post(self):
        token = self.get_body_argument('token', default='')
        if token != const.TOKEN:
            self.send_error()
            return

        ID = self.get_body_argument('id', default='')
        status = self.get_body_argument('status', default='')
        info = self.get_body_argument('info', default='')
        doc = db.ais.find_one({'_id':ObjectId(ID)})
        if doc and doc['status'] == 'Building':
            if status == 'Available':
                upload = self.request.files['ai'][0]
                ai_name = 'ai_' + str(doc['_id'])
                abspath = os.path.join(const.AI_SAVE_DIRECTORY, ai_name)
                output = open(abspath, 'wb')
                output.write(upload['body'])
                output.close()
                os.chmod(abspath, 0755)

                db.ais.update({'_id':doc['_id']}, { '$set': {
                    'status': status,
                    'buildInfo': info,
                    'absPath': abspath
                }})

                self.write({'status': 'success'})
                return
            elif status == 'Unavailable':
                db.ais.update({'_id':doc['_id']}, { '$set': {
                    'status': status,
                    'buildInfo': info
                }})

                self.write({'status': 'success'})
                return

        self.send_error()



class UpdateHandler(tornado.web.RequestHandler):
    def post(self):
        token = self.get_body_argument('token', default='')
        if token != const.TOKEN:
            self.send_error()
            return

        data = self.get_body_argument('data', default='{}')
        json = loadJSON(data)
        for collection in json:
            for record in json[collection]:
                db[collection].update(record['where'], record['value'])
        self.write({'status': 'success'})
        return

application = tornado.web.Application([
    (r'/task', TaskHandler),
    (r'/find_one', FindOneHandler),
    (r'/download', DownloadHandler),
    (r'/upload', UploadHandler),
    (r'/update', UpdateHandler)
], debug=True)

if __name__ == "__main__":
    application.listen(4000)
    tornado.ioloop.IOLoop.instance().start()
