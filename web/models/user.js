var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
    name: { type: String, index: {unique: true} },
    password:  String,
    registerDate: {type: Date, default: Date.now },
    win: { type: Number, default: 0 },
    draw: { type: Number, default: 0 },
    lose: { type: Number, default: 0 },
    submit: { type: Number, default: 0 },
    rating: { type: Number, default: 1500 },
});

module.exports = db.model('user', schema);
