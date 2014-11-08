var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
	user1    : { type: String },
    name1    : { type: String },
	idOfUser1: { type: Number },
	user2    : { type: String },
    name2    : { type: String },
	idOfUser2: { type: Number },
	status: { type: String, default: "Pending" },
	winner: {
		ai:   { type: String },
		user: { type: String },
	},
	log: { type: String },
    uploadDate: { type: Date, default: Date.now },
    judgeDate : { type: Date, default: Date.now },
});

module.exports = db.model('record', schema);
