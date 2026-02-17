const express = require('express');
const router = express.Router();
const boutiqueController = require('../controllers/boutique.controller');

// GET all shops
router.get('/', boutiqueController.getAllBoutiques);

// GET shops by category
router.get('/categorie/:categorieId', boutiqueController.getBoutiquesByCategorie);

// GET shops by status
router.get('/statut/:statut', boutiqueController.getBoutiquesByStatut);

// GET a single shop by ID
router.get('/:id', boutiqueController.getBoutiqueById);

// POST create a new shop
router.post('/', boutiqueController.createBoutique);

// PUT update a shop
router.put('/:id', boutiqueController.updateBoutique);

// DELETE a shop
router.delete('/:id', boutiqueController.deleteBoutique);

module.exports = router;
