const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();

router.route('/')
	.get(userController.listUsers)
	.post(userController.addUser)
router.route('/delete/:userId')
	.post(userController.deleteUser)
router.route('/put/:userId')
	.post(userController.updateUser)
router.route('/:userId')
	.get(userController.readUser)
router.route('/:token')
	.get(userController.checkTokenEndpoint)

module.exports = router