const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/demandeBoutique.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');
const { createDemandeValidator, listDemandeValidator, updateStatutValidator } = require('../validators/demandeBoutique.validator');

// Public : soumettre une demande
router.post('/', createDemandeValidator, ctrl.createDemande);

// Admin : lister, consulter, mettre à jour le statut
router.get('/', auth, authorize(['admin']), listDemandeValidator, ctrl.listDemandes);
router.get('/:id', auth, authorize(['admin']), ctrl.getDemande);
router.patch('/:id/statut', auth, authorize(['admin']), updateStatutValidator, ctrl.updateStatut);

module.exports = router;
