const { body, param } = require('express-validator');

exports.createProduitValidator = [
  body('boutiqueId')
    .notEmpty().withMessage('La boutique est requise')
    .isMongoId().withMessage('Identifiant de boutique invalide'),
  body('nom')
    .notEmpty().withMessage('Le nom du produit est requis')
    .isString().trim(),
  body('description')
    .optional()
    .isString(),
  body('prix')
    .notEmpty().withMessage('Le prix est requis')
    .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('enAvant')
    .optional()
    .isBoolean(),
];

exports.updateProduitValidator = [
  param('id')
    .isMongoId().withMessage('Identifiant invalide'),
  body('nom')
    .optional()
    .isString().trim(),
  body('description')
    .optional()
    .isString(),
  body('prix')
    .optional()
    .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('enAvant')
    .optional()
    .isBoolean(),
];
