const express = require('express');
const notificationsController = require('../controller/notificationsController');
const router = express.Router();

router.route('/')
    .get(notificationsController.listNotifications)
router.route('/:token')
    .get(notificationsController.listLocationsByToken)
