var settings = require('../settings');
var utility = require('./utility');
var AI = require('../models/ai');
var Record = require('../models/record');
var ObjectId = require('mongoose').Types.ObjectId;

exports.getJSON = function(req, res) {
    var id = req.param('id');
    Record.findOne({'_id': ObjectId(id)}).select('log').exec(function(err, doc) {
        if (!doc) {
            res.send('404 Not Found!');
            return;
        }
        res.set('Content-Type', 'application/json');
        res.send(doc.log);
    });
};

exports.getSteps = function(req, res) {
    var id = req.param('id');
    Record.findOne({'_id': ObjectId(id)}).select('step status').exec(function(err, doc) {
        if (!doc) {
            res.send('404 Not Found!');
            return;
        }
        res.set('Content-Type', 'application/json');
        res.send(doc);
    });
}

exports.getStderr = function(req, res) {
    var id = req.param('id');
    var aid = Number(req.param('aid'))-1;
    Record.findOne({'_id': ObjectId(id)}).select('stderr'+aid).exec(function(err, doc) {
        if (!doc) {
            res.send('404 Not Found!');
            return;
        }
        res.set('Content-Type', 'text/plain');
        res.send(doc['stderr'+aid]);
    });
};

exports.showDemo = function(req, res) {
    var id = req.param('id');
    Record.findOne({'_id': ObjectId(id)}, function(err, doc) {
        if (!doc) {
            res.send('404 Not Found!');
            return;
        }

        var info = utility.prepareRenderMessage(req);
        info.title = "Demo";
        info.rec = doc;
        res.render('battle_demo', info);
    });
};

exports.showList = function(req, res) {
    Record.count({}, function(err, count) {
        var page = Number(req.query.page || '1');
        var skip = settings.battlePerPage * (page-1);

        Record.find({}).select({log:0,stderr0:0,stderr1:0}).sort({_id:-1}).skip(skip).limit(settings.battlePerPage).exec(function(err, doc) {
            var info =utility.prepareRenderMessage(req);
            info.title = 'Battle List';
            info.list = doc;
            info.page = page;
            info.totpage = Math.ceil(count / settings.battlePerPage);
            info.getColor = function(result, expect) {
                if (result === -1) return '';
                if (result === 2) return 'warning';
                return result === expect ? 'success' : 'danger';
            }
            return res.render('battle_list', info);
        });
    });
};

exports.execStart = function(req, res) {
    if (!req.session.user.isLogin) return res.redirect('/user/login');
    var ai0 = ObjectId(req.body.ai0);
    var ai1 = ObjectId(req.body.ai1);
    AI.findOne({_id:ai0}, function(err, doc0) {
        if (!doc0 || doc0.user !== req.session.user.name) {
            res.send('Permission Denied');
            return;
        }

        AI.findOne({_id:ai1}, function(err, doc1) {
            if (!doc1) {
                res.send("Target AI doesn't exist");
                return;
            }

            var info = {
                user0: doc0.user,
                name0: doc0.name,
                idOfUser0: doc0.idOfUser,
                user1: doc1.user,
                name1: doc1.name,
                idOfUser1: doc1.idOfUser,
                ids: [doc0._id, doc1._id],
            };
            var item = new Record(info);
            item.save(function(err, doc) {
                return res.redirect('/battle/' + doc._id);
            })
        })
    })
}
