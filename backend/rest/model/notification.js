const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let NotificationSchema = new Schema({
    token: {type: String, required: true},
    queue: {type: Array, required: true}
});

module.exports = mongoose.model('Notification', NotificationSchema);