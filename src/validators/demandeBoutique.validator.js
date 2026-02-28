const { body, param, query } = require('express-validator');

const createDemandeValidator = [
    // boutiqueId is injected server-side from req.user, not sent by the client
    body('emplacementSouhaiteId').isMongoId().withMessage('Emplacement souhaité invalide')
];

const listDemandeValidator = [
    query('statut').optional().isIn(['en_attente', 'acceptee', 'refusee']).withMessage('Statut invalide')
];

const updateStatutValidator = [
    param('id').isMongoId().withMessage('Identifiant invalide'),
    body('statut').isIn(['acceptee', 'refusee']).withMessage('Statut invalide'),
    body('motifRefus').optional().isString().withMessage('Motif invalide')
];

module.exports = {
    createDemandeValidator,
    listDemandeValidator,
    updateStatutValidator
};
