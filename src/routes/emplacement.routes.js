const express = require('express');
const router = express.Router();
const emplacementController = require('../controllers/emplacement.controller');

// GET all emplacements
router.get('/', emplacementController.getAllEmplacements);

// GET available emplacements
router.get('/disponibles', emplacementController.getAvailableEmplacements);

// GET emplacements by floor
router.get('/etage/:etageId', emplacementController.getEmplacementsByEtage);

// GET a single emplacement by ID
router.get('/:id', emplacementController.getEmplacementById);

// POST create a new emplacement
router.post('/', emplacementController.createEmplacement);

// PUT update an emplacement
router.put('/:id', emplacementController.updateEmplacement);

// DELETE an emplacement
router.delete('/:id', emplacementController.deleteEmplacement);

module.exports = router;
