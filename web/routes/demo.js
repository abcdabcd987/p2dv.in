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
        res.render('demo', info);
    });
};
