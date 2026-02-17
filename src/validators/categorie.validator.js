const { body, param } = require('express-validator');

const createCategorieValidator = [
    body('nom').notEmpty().withMessage('Nom requis').trim(),
    body('description').optional().isString().withMessage('Description invalide').trim(),
    body('icone').optional().isString().withMessage('Icône invalide')
];

const updateCategorieValidator = [
    param('id').isMongoId().withMessage('Identifiant invalide'),
    body('nom').optional().notEmpty().withMessage('Nom requis').trim(),
    body('description').optional().isString().withMessage('Description invalide').trim(),
    body('icone').optional().isString().withMessage('Icône invalide')
];

module.exports = {
    createCategorieValidator,
    updateCategorieValidator
};
