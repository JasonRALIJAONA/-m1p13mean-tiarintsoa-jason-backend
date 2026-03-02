const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');
const { adminDashboardStatsValidator } = require('../validators/dashboard.validator');

router.get('/admin', auth, authorize(['admin']), adminDashboardStatsValidator, ctrl.getAdminStats);

module.exports = router;
