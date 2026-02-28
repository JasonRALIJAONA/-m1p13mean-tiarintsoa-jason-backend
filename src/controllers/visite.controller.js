const { validationResult } = require('express-validator');
const Visite = require('../models/Visite');

exports.create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

        const payload = {
            type: req.body.type,
            boutiqueId: req.body.boutiqueId || null,
            userId: req.user ? req.user.userId : null
        };

        const visite = await Visite.create(payload);
        return res.success(visite, 'Visite enregistrée', 201);
    } catch (error) {
        next(error);
    }
};

exports.list = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

        const { type, boutiqueId } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (boutiqueId) filter.boutiqueId = boutiqueId;

        const visites = await Visite.find(filter).sort({ createdAt: -1 }).limit(1000);
        return res.success(visites, 'Liste des visites');
    } catch (error) {
        next(error);
    }
};
