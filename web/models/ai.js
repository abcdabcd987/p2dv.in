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
    status: { type: String, default: "Pending" },
    buildInfo: { type: String },
    absPath: { type: String },
});

module.exports = db.model('ai', schema);

module.exports.getidOfUser = function(user, cb) {
    module.exports.count({user: user}, function(err, count) {
    	if (err) throw err;
    	cb(count+1);
    });
};
