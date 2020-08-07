const express = require('express');
const typeUserController = require('../controller/typeUserController');
const router = express.Router();

router.route('/')
	.get(typeUserController.listUserTypes)
	.post(typeUserController.addUserType)
router.route('/:token')
	.get(typeUserController.listTypesByToken)
router.route('/delete/:userTypeId')
	.post(typeUserController.deleteUserType)
router.route('/put/:userTypeId')
	.post(typeUserController.updateUserType)
router.route('/id/:userTypeId')
	.get(typeUserController.readUserType)

module.exports = router