const express = require('express');
const router = express.Router();
const etageController = require('../controllers/etage.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

// GET all floors
router.get('/', etageController.getAllEtages);

// GET a single floor by ID
router.get('/:id', etageController.getEtageById);

// POST create a new floor
router.post('/', auth, authorize(['admin']), etageController.createEtage);

// PUT update a floor
router.put('/:id', auth, authorize(['admin']), etageController.updateEtage);

// DELETE a floor
router.delete('/:id', auth, authorize(['admin']), etageController.deleteEtage);

module.exports = router;
