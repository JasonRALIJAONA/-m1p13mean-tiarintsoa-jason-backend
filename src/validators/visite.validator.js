const { body, query } = require('express-validator');

const createVisiteValidator = [
    body('type').isIn(['site', 'boutique']).withMessage('Type invalide'),
    body('boutiqueId')
        .if((value, { req }) => req.body.type === 'boutique')
        .isMongoId()
        .withMessage('boutiqueId invalide')
];

const listVisiteValidator = [
    query('type').optional().isIn(['site', 'boutique']).withMessage('Type invalide'),
    query('boutiqueId').optional().isMongoId().withMessage('boutiqueId invalide')
];

module.exports = {
    createVisiteValidator,
    listVisiteValidator
};
