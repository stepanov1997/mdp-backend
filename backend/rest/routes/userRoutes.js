const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();


router.route('/users')
	.get(userController.listUsers)
	.post(userController.addUser)

router.route('/users/delete/:userId')
	.post(userController.deleteUser)

router.route('/users/put/:userId')
	.post(userController.updateUser)

router.route('/users/:userId')
	.get(userController.readUser)

	
module.exports = router