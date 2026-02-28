const { body, param, query } = require('express-validator');

const createDemandeValidator = [
    body('boutiqueId').isMongoId().withMessage('Identifiant de boutique invalide'),
    body('emplacementSouhaiteId').isMongoId().withMessage('Emplacement souhaité invalide'),
    body('dateDebutSouhaitee').isISO8601().withMessage('Date de début invalide (format ISO 8601 requis)'),
    body('dateFinSouhaitee').optional({ nullable: true }).isISO8601().withMessage('Date de fin invalide (format ISO 8601 requis)')
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
