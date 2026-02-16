const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorie.controller');

// GET all categories
router.get('/', categorieController.getAllCategories);

// GET a single category by ID
router.get('/:id', categorieController.getCategorieById);

// POST create a new category
router.post('/', categorieController.createCategorie);

// PUT update a category
router.put('/:id', categorieController.updateCategorie);

// DELETE a category
router.delete('/:id', categorieController.deleteCategorie);

module.exports = router;
