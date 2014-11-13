var settings = require('../settings');
var utility = require('./utility');
var AI = require('../models/ai');
var Record = require('../models/record');
var ObjectId = require('mongoose').Types.ObjectId;

exports.getJSON = function(req, res) {
    var id = req.param('id');
    Record.findOne({'_id': ObjectId(id)}, function(err, doc) {
        if (!doc) {
            res.send('404 Not Found!');
            return;
        }
        res.set('Content-Type', 'application/json');
        res.send(doc.log);
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

        Record.find({}).select({log:0}).sort({_id:-1}).skip(skip).limit(settings.battlePerPage).exec(function(err, doc) {
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
