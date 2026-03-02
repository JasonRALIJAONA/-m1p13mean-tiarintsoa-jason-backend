const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/produit.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');
const { createProduitValidator, updateProduitValidator } = require('../validators/produit.validator');

// ─── Public routes ────────────────────────────────────────────────────────────
// NOTE: specific paths before /:id to avoid conflicts
router.get('/mes-produits', auth, authorize(['boutique']), ctrl.getMesProduits);
router.get('/boutique/:boutiqueId', ctrl.getProduitsByBoutique);
router.get('/', ctrl.getAllProduits);
router.get('/:id', ctrl.getProduitById);

// ─── Protected routes (boutique owner) ───────────────────────────────────────
router.post('/', auth, authorize(['boutique']), uploadSingle, createProduitValidator, ctrl.createProduit);
router.put('/:id', auth, authorize(['boutique']), uploadSingle, updateProduitValidator, ctrl.updateProduit);
router.delete('/:id', auth, authorize(['boutique']), ctrl.deleteProduit);

module.exports = router;
