var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
    user: { type: String },
    idOfUser: { type: Number },
    name: { type: String, default: '[Unknown]' },
    uploadDate: {type: Date, default: Date.now },
    win:  { type: Number, default: 0 },
    draw: { type: Number, default: 0 },
    lose: { type: Number, default: 0 },
    ratio:{ type: Number, default: 0 },
    status: { type: String, default: "Pending" },
    buildInfo: { type: String, default: '' },
    sourceCode: { type: String, default: '' },
    absPath: { type: String, default: '' },
    rating: { type: Number, default: 1500 },
});

module.exports = db.model('ai', schema);

module.exports.getidOfUser = function(user, cb) {
    module.exports.count({user: user}, function(err, count) {
    	if (err) throw err;
    	cb(count+1);
    });
};

var ObjectId = require('mongoose').Types.ObjectId;
var Record = require('./record');

module.exports.getFullStatus = function(id, cb) {
    module.exports.findOne({'_id':ObjectId(id)}, function(err, ai) {
        if (err) {
            console.log(err);
        }
        if (!ai) {
            cb(null);
            return;
        }
        var info = {
            ai: ai,
            wins: [],
            lose: [],
            draw: []
        };
        Record.find({ 'status': 'Finished', '$or': [
            { 'winnerId': ai._id },
            { 'loserId':  ai._id },
            { 'result': 2, 'ids': ai._id }
        ]}).select({log:0,stderr0:0,stderr1:0}).sort({_id:-1}).exec(function(err, docs) {
            if (err) {
                console.log(err);
            }
            for (var i = 0; i < docs.length; ++i) {
                docs[i].log = '';
                if (docs[i].winnerId && docs[i].winnerId.equals(ai._id)) {
                    info.wins.push(docs[i]);
                } else if (docs[i].loserId && docs[i].loserId.equals(ai._id)) {
                    info.lose.push(docs[i]);
                } else {
                    info.draw.push(docs[i]);
                }
            }
            cb(info);
        })
    })
}
