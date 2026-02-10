const { body, param, query } = require('express-validator');

const createDemandeValidator = [
    body('nom').notEmpty().withMessage('Nom requis').trim(),
    body('description').notEmpty().withMessage('Description requise').trim(),
    body('categorieId').isMongoId().withMessage('Categorie invalide'),
    body('logo').optional().isString().withMessage('Logo invalide'),
    body('emplacementSouhaiteId').optional().isMongoId().withMessage('Emplacement souhaite invalide'),
    body('contactNom').notEmpty().withMessage('Nom du responsable requis').trim(),
    body('contactPrenom').notEmpty().withMessage('Prenom du responsable requis').trim(),
    body('contactEmail').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('contactTelephone').notEmpty().withMessage('Telephone requis').trim()
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
