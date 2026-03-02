const { body, param } = require('express-validator');

exports.createPromotionValidator = [
  body('boutiqueId')
    .notEmpty().withMessage('La boutique est requise')
    .isMongoId().withMessage('Identifiant de boutique invalide'),
  body('titre')
    .notEmpty().withMessage('Le titre est requis')
    .isString().trim(),
  body('description')
    .optional()
    .isString(),
  body('dateDebut')
    .notEmpty().withMessage('La date de début est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('dateFin')
    .notEmpty().withMessage('La date de fin est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('reduction')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 }).withMessage('La réduction doit être entre 0 et 100'),
];

exports.updatePromotionValidator = [
  param('id')
    .isMongoId().withMessage('Identifiant invalide'),
  body('titre')
    .optional()
    .isString().trim(),
  body('description')
    .optional()
    .isString(),
  body('dateDebut')
    .optional()
    .isISO8601().withMessage('Format de date invalide'),
  body('dateFin')
    .optional()
    .isISO8601().withMessage('Format de date invalide'),
  body('reduction')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 }).withMessage('La réduction doit être entre 0 et 100'),
];
