const express = require('express');
const bodyParser = require('body-parser');
const typeUserRoutes = require('./routes/typeUserRoutes');
const locationRoutes = require('./routes/locationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/userTypes', typeUserRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes)
app.set('json spaces', 2)

// Set up mongoose connection
const mongoose = require('mongoose');
let dev_db_url = require('./config.json').mongoDbServer;
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const server = app.listen(require('./config.json').restPort, function () {
	const port = server.address().port;
	console.log("Central register started... Listening requests on port "+port)
});

module.exports = app;