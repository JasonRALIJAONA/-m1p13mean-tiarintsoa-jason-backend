const { query } = require('express-validator');

const adminDashboardStatsValidator = [
    query('days')
        .optional()
        .isInt({ min: 1, max: 90 })
        .withMessage('days doit être un entier entre 1 et 90')
];

const shopDashboardStatsValidator = [
    query('days')
        .optional()
        .isInt({ min: 1, max: 90 })
        .withMessage('days doit être un entier entre 1 et 90')
];

module.exports = {
    adminDashboardStatsValidator,
    shopDashboardStatsValidator
};
