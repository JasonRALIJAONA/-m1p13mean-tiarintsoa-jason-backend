const express = require('express');
const router = express.Router();
const emplacementController = require('../controllers/emplacement.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

// Public reads (needed for the interactive map and slot selection dropdown)
router.get('/', emplacementController.getAllEmplacements);
router.get('/disponibles', emplacementController.getAvailableEmplacements);
router.get('/etage/:etageId', emplacementController.getEmplacementsByEtage);
router.get('/:id', emplacementController.getEmplacementById);

// Admin-only mutations
router.post('/', auth, authorize(['admin']), emplacementController.createEmplacement);
router.put('/:id', auth, authorize(['admin']), emplacementController.updateEmplacement);
router.delete('/:id', auth, authorize(['admin']), emplacementController.deleteEmplacement);

module.exports = router;
