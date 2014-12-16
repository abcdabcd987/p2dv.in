var fs = require('fs');
var path = require('path');
var moment = require('moment');
var settings = require('../settings');
var utility = require('./utility');
var AI = require('../models/ai');
var User = require('../models/user');
var AIRating = require('../models/airating');
var ObjectId = require('mongoose').Types.ObjectId;

var processUpload = function(ai) {
    var type = ai.type;
    var size = ai.size;

    if ((type !== 'application/zip' && type === 'application/octet-stream' && ai.path.substr(-4, 4) !== '.zip') || 
        !size || size > 1*1024*1024) {
        try {
            fs.unlinkSync(ai.path);
        } catch (err) {
            console.log('cannot remove [%s]', ai.path);
        }
        
        if (type !== 'application/zip') return {err:'Not a zip file'};
        if (!size) return {err:'Empty file'};
        if (size > 50*1024*1024) return {err:'File size > 50MBytes'};
    } else {
        var str = utility.generateRandomString() + Date.now();
        var ext = '.zip';
        var newpath = path.join(settings.uploadPath, str + ext);
        try {
            fs.renameSync(ai.path, newpath);
        } catch (err) {
            console.log('cannot rename [%s] to [%s]', ai.path, newpath);
            console.log(err);
            return {err:'Cannot rename zip file'};
        }
        return { err: null, abspath: newpath };
    }
}

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

    if (typeof(req.files) === 'undefined' || typeof(req.files.ai) === 'undefined') {
        return fallback(['No zip file was uploaded']);
    }
    var ai = processUpload(req.files.ai);
    if (ai.err) {
        return fallback([ai.err]);
    }

    AI.getidOfUser(req.session.user.name, function(id) {
        var info = {
            user: req.session.user.name,
            idOfUser: id,
            absPath: ai.abspath
        }
        var item = new AI(info);
        item.save(function(err, saved) {
            if (err) return fallback(['Unknown Error']);
            User.update({name: req.session.user.name}, {$inc:{submit:1}}, function(err, num) {
                res.redirect('/ai/' + saved.id);
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
