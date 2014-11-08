var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
    name: { type: String, index: {unique: true} },
    password:  String,
    registerDate: {type: Date, default: Date.now },
});

module.exports = db.model('user', schema);
