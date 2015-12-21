var db = require('./db');
var Schema = db.Schema;

var ai = new Schema({
    ai_id: Schema.Types.ObjectId,
    name: String,
    user: String,
    idOfUser: Number,
    win: { type: Number, default: 0 },
    draw: { type: Number, default: 0 },
    lose: { type: Number, default: 0 },
});

var schema = new Schema({
    ais: [ai],
    title: String,
    submited: { type: String, default: 'no' },
    createDate: { type: Date, default: Date.now },
    running: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    finished: { type: Number, default: 0 },
});

exports.Contest = db.model('contest', schema);
exports.ContestAI = ai;
