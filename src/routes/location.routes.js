const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/location.controller');

// Public: active locations for a given floor
router.get('/actives', ctrl.getActiveByEtage);

module.exports = router;
