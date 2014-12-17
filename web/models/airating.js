var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
    id: Schema.Types.ObjectId,
    date: { type: Date, default: Date.now },
    rating: { type: Number, default: 1500 }
});

module.exports = db.model('airating', schema);
