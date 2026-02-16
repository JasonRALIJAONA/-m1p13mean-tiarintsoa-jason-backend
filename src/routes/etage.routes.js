const express = require('express');
const router = express.Router();
const etageController = require('../controllers/etage.controller');

// GET all floors
router.get('/', etageController.getAllEtages);

// GET a single floor by ID
router.get('/:id', etageController.getEtageById);

// POST create a new floor
router.post('/', etageController.createEtage);

// PUT update a floor
router.put('/:id', etageController.updateEtage);

// DELETE a floor
router.delete('/:id', etageController.deleteEtage);

module.exports = router;
