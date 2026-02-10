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

module.exports = router;
