const express = require('express');
const bodyParser = require('body-parser')
const userRoutes = require('./routes/userRoutes');
const typeUserRoutes = require('./routes/typeUserRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/userTypes', typeUserRoutes);
app.use('/api/locations', locationRoutes);
app.set('json spaces', 2)

// Set up mongoose connection
const mongoose = require('mongoose');
let dev_db_url = 'mongodb://127.0.0.1:27017/db?gssapiServiceName=mongodb';
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var server = app.listen(8081, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
})

module.exports = app;