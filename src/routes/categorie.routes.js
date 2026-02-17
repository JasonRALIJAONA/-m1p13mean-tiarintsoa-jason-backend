const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categorie.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');
const { createCategorieValidator, updateCategorieValidator } = require('../validators/categorie.validator');

// Admin uniquement
router.use(auth, authorize(['admin']));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', createCategorieValidator, ctrl.create);
router.patch('/:id', updateCategorieValidator, ctrl.update);
router.delete('/:id', ctrl.remove);
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
