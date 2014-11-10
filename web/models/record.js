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
	winner: {
		ai:   { type: String },
		user: { type: String },
	},
	log: { type: String },
    submitDate: { type: Date, default: Date.now },
    runDate : { type: Date, default: Date.now },
});

module.exports = db.model('record', schema);
