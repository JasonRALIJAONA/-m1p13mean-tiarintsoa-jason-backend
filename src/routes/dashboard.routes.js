const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');
const { adminDashboardStatsValidator, shopDashboardStatsValidator } = require('../validators/dashboard.validator');

router.get('/admin', auth, authorize(['admin']), adminDashboardStatsValidator, ctrl.getAdminStats);
router.get('/boutique', auth, authorize(['boutique']), shopDashboardStatsValidator, ctrl.getShopStats);

module.exports = router;
