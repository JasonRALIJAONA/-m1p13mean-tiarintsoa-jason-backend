const { body } = require('express-validator');

const registerValidator = [
    body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mot de passe trop court (min 6 caractères)'),
    body('role')
        .optional()
        .isIn(['admin', 'boutique', 'acheteur'])
        .withMessage('Role invalide'),
    body('nom')
        .notEmpty()
        .withMessage('Nom requis')
        .trim(),
    body('prenom')
        .notEmpty()
        .withMessage('Prénom requis')
        .trim()
];

const loginValidator = [
    body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis')
];

module.exports = {
    registerValidator,
    loginValidator
};
