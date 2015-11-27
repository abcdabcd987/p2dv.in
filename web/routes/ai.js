var fs = require('fs');
var path = require('path');
var moment = require('moment');
var settings = require('../settings');
var utility = require('./utility');
var AI = require('../models/ai');
var User = require('../models/user');
var AIRating = require('../models/airating');
var ObjectId = require('mongoose').Types.ObjectId;

exports.showUpload = function(req, res) {
    if (!req.session.user.isLogin) return res.redirect('/user/login');
    var info = utility.prepareRenderMessage(req);
    info.title = "Upload AI";
    res.render('ai_upload', info);
};

exports.execUpload = function(req, res) {
    if (!req.session.user.isLogin) return res.redirect('/user/login');
    res.locals.message = res.locals.message || [];
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        info.actionUrl = '/ai/upload';
        info.title = "Upload AI";
        return res.render('ai_upload', info);
    };

    if (!req.body.source_code) {
        return fallback(['Empty source code']);
    }

    AI.getidOfUser(req.session.user.name, function(id) {
        var info = {
            user: req.session.user.name,
            idOfUser: id,
            sourceCode: req.body.source_code
        }
        var item = new AI(info);
        item.save(function(err, saved) {
            if (err) return fallback(['Unknown Error']);
            User.update({name: req.session.user.name}, {$inc:{submit:1}}, function(err, num) {
                var rating = new AIRating({id: saved._id});
                rating.save(function(err, s) {
                    res.redirect('/ai/' + saved.id);
                })
            });
        });
    });
};

exports.showStatus = function(req, res) {
    var id = req.param('id');
    AI.getFullStatus(id, function(doc) {
        if (!doc) {
            res.send('404 Not Found!');
            return;
        }

        var info = utility.prepareRenderMessage(req);
        info.title = 'AI Status';
        info.ai = doc.ai;
        info.wins = doc.wins;
        info.lose = doc.lose;
        info.draw = doc.draw;

        if (info.user.isLogin) {
            AI.find({ user: info.user.name, status: 'Available' }).sort({ _id: -1}).exec(function(err, doc) {
                info.myAI = doc || [];
                return res.render('ai_status', info);
            })
        } else {
            return res.render('ai_status', info);
        }
    })
}

exports.showList = function(req, res) {
    var username = req.query.username || '';
    var showchart = req.query.chart || false;
    var cond = username ? {user: username} : {};
    AI.count(cond, function(err, count) {
        var page = Number(req.query.page || '1');
        var skip = settings.AIPerPage * (page-1);
        var sort = req.query.sort || '-_id';

        AI.find(cond).sort(sort).skip(skip).limit(settings.AIPerPage).exec(function(err, doc) {
            var info =utility.prepareRenderMessage(req);
            info.page = page;
            info.totpage = Math.ceil(count / settings.AIPerPage);
            info.sort = sort;
            info.username = username;
            info.showRatingChart = page === 1 && username && showchart;

            info.title = 'AI List';
            info.list = doc;
            return res.render('ai_list', info);
        });
    });
}

exports.getRatingJSON = function(req, res) {
    var id = req.param('id');
    AIRating.find({id: ObjectId(id)}).select({date:1, rating:1}).sort({_id:1}).exec(function(err, doc) {
        result = { x: 'Date', xFormat: '%m-%d %H:%M', columns: [['Date'], ['Rating']] };
        for (var i = 0; i < doc.length; ++i) {
            var rating = doc[i].rating;
            var date = moment(doc[i].date).format('MM-DD HH:mm');
            result.columns[0].push(date);
            result.columns[1].push(rating);
        }
        res.json(result);
    })
}
