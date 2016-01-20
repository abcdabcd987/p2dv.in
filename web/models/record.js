var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
	user0    : { type: String },
    name0    : { type: String },
	idOfUser0: { type: Number },
	user1    : { type: String },
    name1    : { type: String },
	idOfUser1: { type: Number },
	status: { type: String, default: "Pending" },
    result   : { type: Number, default: -1 },
    step     : { type: Number, default: 0 },
    winnerId : Schema.Types.ObjectId,
    loserId  : Schema.Types.ObjectId,
    ids      : [Schema.Types.ObjectId],
	winner: {
		name: { type: String },
		user: { type: String },
        idOfUser: { type: Number },
	},
    loser: {
        name: { type: String },
        user: { type: String },
        idOfUser: { type: Number },
    },
	log: { type: String },
    stdin0: { type: String },
    stdout0: { type: String },
    stderr0: { type: String },
    stdin1: { type: String },
    stdout1: { type: String },
    stderr1: { type: String },
    judger: { type: String, default: '' },
    contestId: { type: Schema.Types.ObjectId, default: Schema.Types.ObjectId("000000000000000000000000") },
    submitDate: { type: Date, default: Date.now },
    runDate : { type: Date, default: Date.now },
});

module.exports = db.model('record', schema);
