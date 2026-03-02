const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/demandeBoutique.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');
const { createDemandeValidator, listDemandeValidator, updateStatutValidator } = require('../validators/demandeBoutique.validator');

// Boutique : soumettre une demande d'emplacement (authentifié, rôle boutique)
router.post('/', auth, authorize(['boutique']), createDemandeValidator, ctrl.createDemande);

// Boutique : consulter ses propres demandes
// Note: /mes-demandes must be declared BEFORE /:id to avoid route collision
router.get('/mes-demandes', auth, authorize(['boutique']), ctrl.getMesDemandes);
router.get('/:id', auth, authorize(['admin', 'boutique']), ctrl.getDemande);

// Admin : lister, consulter, mettre à jour le statut
router.get('/', auth, authorize(['admin']), listDemandeValidator, ctrl.listDemandes);
router.patch('/:id/statut', auth, authorize(['admin']), updateStatutValidator, ctrl.updateStatut);

module.exports = router;
