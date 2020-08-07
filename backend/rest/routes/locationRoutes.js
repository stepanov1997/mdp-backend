const express = require('express');
const locationController = require('../controller/locationController');
const router = express.Router();

router.route('/')
	.get(locationController.listLocations)
    .post(locationController.addLocation)
router.route('/:token')
	.get(locationController.listLocationsByToken)
router.route('/delete/:locationId')
	.post(locationController.deleteLocation)
router.route('/put/:locationId')
	.post(locationController.updateLocation)
router.route('/id/:locationId')
	.get(locationController.readLocation)

module.exports = router