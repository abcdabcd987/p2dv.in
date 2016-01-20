var fs = require('fs');
var path = require('path');
var moment = require('moment');
var settings = require('../settings');
var utility = require('./utility');
var AI = require('../models/ai');
var User = require('../models/user');
var Record = require('../models/record');
var Contest = require('../models/contest').Contest;
var ContestAI = require('../models/contest').ContestAI;
var ObjectId = require('mongoose').Types.ObjectId;

function processAIList(doc_ais) {
    var ais = doc_ais.toObject();
    for (var i = 0; i < ais.length; ++i) {
        var a = ais[i];
        a.score = a.win * 3 + a.draw * 1 + a.lose * 0;
    }
    ais.sort(function(a, b) { return b.score - a.score; });
    for (var i = 0; i < ais.length; ++i) {
        ais[i].rank = i+1;
    }
    return ais;
}

exports.getStatus = function(req, res) {
    var id = req.param('id');
    Contest.findById(id, function(err, doc) {
        if (err) { res.send(err.toString()); return; }
        if (!doc) {res.send('404 Not Found!'); return; }
        var recs = { 'Running': doc.running, 'Pending': doc.pending, 'Finished': doc.finished };
        res.send({
            ais: processAIList(doc.ais),
            recs: recs
        });
    });
}

exports.showCreate = function(req, res) {
    var isAdmin = settings.adminUsernames.indexOf(req.session.user.name) > -1;
    if (!isAdmin) {res.redirect('/'); }
    var info = utility.prepareRenderMessage(req);
    info.title = 'Create Contest';
    res.render('contest_create', info);
};

exports.showContest = function(req, res) {
    var id = req.param('id');
    Contest.findById(id, function(err, doc) {
        if (err) { res.send(err); return; }
        if (!doc) {res.send('404 Not Found!'); return; }

        var recs = { 'Running': doc.running, 'Pending': doc.pending, 'Finished': doc.finished };
        var info = utility.prepareRenderMessage(req);
        info.title = doc.title;
        info.ais = processAIList(doc.ais);
        info.id = id;
        info.createDate = doc.createDate;
        info.submited = doc.submited;
        info.recs = recs;
        res.render('contest_detail', info);
    })
};

exports.execCreate = function(req, res) {
    var isAdmin = settings.adminUsernames.indexOf(req.session.user.name) > -1;
    if (!isAdmin) {res.redirect('/'); }

    var info = {
        title: req.body.title,
        ais: [],
        password: settings.hashPassword(req.body.password),
    };
    var item = new Contest(info);
    item.save(function(err, saved) {
        if (err) { res.send(err); return; }
        res.redirect('/contest/' + saved.id);
    })
};

exports.execAddAI = function(req, res) {
    var isAdmin = settings.adminUsernames.indexOf(req.session.user.name) > -1;
    if (!isAdmin) {res.redirect('/'); }

    if (!req.body.ais) { res.send('empty content'); return; }
    var contest_id = req.param('id');
    Contest.findById(contest_id, function(err, doc_contest) {
        if (err) { res.send(err.toString()); return; }
        if (!doc_contest) { res.send('contest not found'); return; }
        try {
            var ai_list = req.body.ais
                .trim()
                .split('\n')
                .map(Function.prototype.call, String.prototype.trim)
                .filter(function(x) {
                    for (var i = 0; i < doc_contest.ais.length; ++i) {
                        if (doc_contest.ais[i].ai_id.toString() == x)
                            return false;
                    }
                    return true;
                })
                .map(ObjectId);
        } catch (e) {
            res.send(e.toString()); return;
        }

        AI.find({_id: {$in: ai_list}}, function(err, docs) {
            if (err) { res.send(err.toString()); return; }
            if (docs.length != ai_list.length) { res.send('some IDs of AI not found'); return; }
            for (var i = 0; i < docs.length; ++i) {
                doc_contest.ais.push({
                    ai_id: docs[i]._id,
                    name: docs[i].name,
                    user: docs[i].user,
                    idOfUser: docs[i].idOfUser
                });
            }
            doc_contest.save(function(err) {
                if (err) { res.send(err.toString()); return; }
                res.redirect('/contest/' + contest_id);
            })
        })
    })
}

exports.execDelAI = function(req, res) {
    var isAdmin = settings.adminUsernames.indexOf(req.session.user.name) > -1;
    if (!isAdmin) {res.redirect('/'); }

    var contest_id = req.param('id');
    if (!req.param('ai')) { res.send('empty content'); return; }
    try {
        var ai_id = ObjectId(req.param('ai'));
    } catch (e) {
        res.send(e.toString()); return;
    }
    Contest.findById(contest_id, function(err, doc_contest) {
        if (err) { res.send(err); return; }
        if (!doc_contest) { res.send('contest not found'); return; }
        var subdoc = doc_contest.ais.id(ai_id);
        if (subdoc) {
            subdoc.remove();
            doc_contest.save(function(err) {
                if (err) { res.send(err); return; }
                res.redirect('/contest/' + contest_id);
            });
        } else {
            res.send('subdoc not found');
            return;
        }
    })
}

exports.execSubmit = function(req, res) {
    var isAdmin = settings.adminUsernames.indexOf(req.session.user.name) > -1;
    if (!isAdmin) {res.redirect('/'); }

    var contest_id = req.param('id');
    Contest.findById(contest_id, function(err, doc_contest) {
        if (err) { res.send(err); return; }
        if (!doc_contest) { res.send('contest not found'); return; }
        if (doc_contest.submited == 'yes') { res.send('have been submited before'); return; }

        var n = doc_contest.ais.length;
        doc_contest.submited = 'yes';
        doc_contest.pending = 5 * n * (n-1) / 2;
        doc_contest.save(function(err) {
            if (err) { res.send(err); return; }
            contest_id = ObjectId(contest_id);
            var bulk = Record.collection.initializeUnorderedBulkOp();
            var count = 0;
            for (var cnt = 0; cnt < 5; ++cnt) {
                for (var i = 0; i < doc_contest.ais.length; ++i) {
                    var ai0 = doc_contest.ais[i];
                    for (var j = i+1; j < doc_contest.ais.length; ++j) {
                        var ai1 = doc_contest.ais[j];
                        ++count;
                        bulk.insert({
                            user0: ai0.user,
                            name0: ai0.name,
                            idOfUser0: ai0.idOfUser,
                            user1: ai1.user,
                            name1: ai1.name,
                            idOfUser1: ai1.idOfUser,
                            ids: [ai0.ai_id, ai1.ai_id],
                            status: 'Pending',
                            result: -1,
                            step: 0,
                            judger: '',
                            contestId: contest_id,
                            submitDate: Date.now(),
                        })
                    }
                }
            }
            bulk.execute(function(err, result) {
                console.info(result);
                if (result.writeConcernError) { res.send(result.writeConcernError); return; }
                if (result.writeErrors) { res.send(result.writeErrors); return; }
                if (result.nInserted != count) { res.send('inserted ' + result.nInserted + ' of ' + count); return; }
                res.redirect('/contest/' + contest_id);
            });
        });
    })
}