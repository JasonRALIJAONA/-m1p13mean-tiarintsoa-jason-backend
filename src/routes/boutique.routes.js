const express = require('express');
const router = express.Router();
const boutiqueController = require('../controllers/boutique.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

// GET all shops
router.get('/', boutiqueController.getAllBoutiques);

// GET authenticated user's own shops — must be before /:id to avoid param conflict
router.get('/mes-boutiques', auth, authorize(['boutique']), boutiqueController.getMesBoutiques);

// POST create a new shop as the authenticated boutique owner
router.post('/mes-boutiques', auth, authorize(['boutique']), boutiqueController.createMaBoutique);

// GET shops by category
router.get('/categorie/:categorieId', boutiqueController.getBoutiquesByCategorie);

// GET shops by status
router.get('/statut/:statut', boutiqueController.getBoutiquesByStatut);

// GET a single shop by ID
router.get('/:id', boutiqueController.getBoutiqueById);

// POST create a new shop
router.post('/', auth, authorize(['admin']), boutiqueController.createBoutique);

// PUT update a shop
router.put('/:id', auth, authorize(['admin']), boutiqueController.updateBoutique);

// DELETE a shop
router.delete('/:id', auth, authorize(['admin']), boutiqueController.deleteBoutique);

module.exports = router;
