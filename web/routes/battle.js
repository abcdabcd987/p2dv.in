var fs = require('fs');
var path = require('path');
var settings = require('../settings');
var utility = require('./utility');
var AI = require('../models/ai');
var Record = require('../models/record');
var Contest = require('../models/contest').Contest;
var ObjectId = require('mongoose').Types.ObjectId;

function get_text(id, text, res) {
    if (['log', 'stdin0', 'stdout0', 'stderr0', 'stdin1', 'stdout1', 'stderr1'].indexOf(text) === -1) {
        res.send('404 Not Found!');
        return;
    }
    var content_type = text === 'log' ? 'application/json' : 'text/plain';
    Record.findOne({'_id': ObjectId(id)}).select(text).exec(function(err, doc) {
        if (!doc) {
            res.send('404 Not Found!');
            return;
        }
        res.set('Content-Type', content_type);
        var abspath = path.join(settings.textFilePath, doc[text]);
        fs.readFile(abspath, function(err, data) {
            if (err) {
                res.send(err)
                return
            }
            res.send(data);
        });
    });
}

exports.getJSON = function(req, res) {
    var id = req.param('id');
    get_text(id, 'log', res);
};

exports.getText = function(req, res) {
    var id = req.param('id');
    var text = req.param('text');
    get_text(id, text, res);
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

exports.execRejudge = function(req, res) {
    var isAdmin = settings.adminUsernames.indexOf(req.session.user.name) > -1;
    if (!isAdmin) {res.redirect('/'); }
    var id = req.param('id');
    Record.findOne({'_id': ObjectId(id)}, function(err, doc_record) {
        if (!doc_record) {res.send('404 Not Found!'); return; }
        if (!doc_record.contestId || doc_record.contestId == ObjectId("000000000000000000000000")) { res.send('contest not found'); return; }
        if (doc_record.status != 'Finished') { res.send('battle not finished'); return; }

        if (doc_record.result == 0) {
            var update0 = {'$inc':{'ais.$.win': -1}};
            var update1 = {'$inc':{'ais.$.lose': -1}};
        } else if (doc_record.result == 1) {
            var update0 = {'$inc':{'ais.$.lose': -1}};
            var update1 = {'$inc':{'ais.$.win': -1}};
        } else {
            var update0 = {'$inc':{'ais.$.draw': -1}};
            var update1 = {'$inc':{'ais.$.draw': -1}};
        }

        Contest.update({'_id': doc_record.contestId, 'ais.ai_id': doc_record.ids[0]}, update0, function(err) {
            if (err) { res.send(err.toString()); return; }
            Contest.update({'_id': doc_record.contestId, 'ais.ai_id': doc_record.ids[1]}, update1, function(err) {
                if (err) { res.send(err.toString()); return; }
                var update_contest = {$inc:{finished:-1, pending:1}};
                Contest.update({_id: doc_record.contestId}, update_contest, function(err) {
                    if (err) { res.send(err.toString()); return; }
                    doc_record.result = -1;
                    doc_record.status = 'Pending';
                    doc_record.step = 0;
                    doc_record.save(function(err) {
                        if (err) { res.send(err.toString()); return; }
                        return res.redirect('/battle/' + doc_record._id);
                    })
                })
            })
        })
    });
};
