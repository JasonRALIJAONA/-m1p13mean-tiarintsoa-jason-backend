const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promotion.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');
const { createPromotionValidator, updatePromotionValidator } = require('../validators/promotion.validator');

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/mes-promotions', auth, authorize(['boutique']), ctrl.getMesPromotions);
router.get('/actives', ctrl.getActivePromotions);
router.get('/boutique/:boutiqueId', ctrl.getPromotionsByBoutique);
router.get('/', ctrl.getAllPromotions);
router.get('/:id', ctrl.getPromotionById);

// ─── Protected routes (boutique owner) ───────────────────────────────────────
router.post('/', auth, authorize(['boutique']), uploadSingle, createPromotionValidator, ctrl.createPromotion);
router.put('/:id', auth, authorize(['boutique']), uploadSingle, updatePromotionValidator, ctrl.updatePromotion);
router.delete('/:id', auth, authorize(['boutique']), ctrl.deletePromotion);

module.exports = router;
