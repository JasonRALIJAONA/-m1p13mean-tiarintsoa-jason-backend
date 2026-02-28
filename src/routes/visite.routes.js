const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/visite.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');
const { createVisiteValidator, listVisiteValidator } = require('../validators/visite.validator');

// Public : enregistrer une visite (userId ajouté si connecté)
router.post('/', createVisiteValidator, ctrl.create);

// Admin : lister les visites
router.get('/', auth, authorize(['admin']), listVisiteValidator, ctrl.list);

module.exports = router;
