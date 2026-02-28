const { body, param, query } = require('express-validator');

const createDemandeValidator = [
    body('nomBoutique').notEmpty().trim().withMessage('Le nom de la boutique est requis'),
    body('categorieId').isMongoId().withMessage('Catégorie invalide'),
    body('heureOuverture').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure d\'ouverture invalide (format HH:MM)'),
    body('heureFermeture').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fermeture invalide (format HH:MM)'),
    body('joursOuverture').optional().isArray().withMessage('Jours d\'ouverture invalides'),
    body('joursOuverture.*').optional().isIn(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']).withMessage('Jour invalide'),
    body('description').optional().isString(),
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
