const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/location.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

// Admin: all locations
router.get('/', auth, authorize(['admin']), ctrl.getAll);

// Public: active locations for a given floor
router.get('/actives', ctrl.getActiveByEtage);

module.exports = router;
