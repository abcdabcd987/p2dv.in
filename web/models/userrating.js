var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
    id: Schema.Types.ObjectId,
    date: Date,
    rating: Number
});

module.exports = db.model('userrating', schema);
