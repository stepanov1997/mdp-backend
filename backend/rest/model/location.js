const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LocationSchema = new Schema({
    token: {type: String, required: true},
    lat: {type: Number, required: true, min:0},
    long: {type: Number, required: true, min:0}
});

module.exports = mongoose.model('Location', LocationSchema);