const { validationResult } = require('express-validator');
const DemandeBoutique = require('../models/DemandeBoutique');

exports.createDemande = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.fail('Validation échouée', 400, errors.array());
        }

        const demande = await DemandeBoutique.create(req.body);
        return res.success(demande, 'Demande créée', 201);
    } catch (error) {
        next(error);
    }
};

exports.listDemandes = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.fail('Validation échouée', 400, errors.array());
        }

        const { statut } = req.query;
        const filter = statut ? { statut } : {};
        const demandes = await DemandeBoutique.find(filter).sort({ createdAt: -1 });
        return res.success(demandes, 'Liste des demandes');
    } catch (error) {
        next(error);
    }
};

exports.getDemande = async (req, res, next) => {
    try {
        const demande = await DemandeBoutique.findById(req.params.id);
        if (!demande) {
            return res.fail('Demande non trouvée', 404);
        }
        return res.success(demande, 'Demande');
    } catch (error) {
        next(error);
    }
};

exports.updateStatut = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.fail('Validation échouée', 400, errors.array());
        }

        const { statut, motifRefus } = req.body;
        const demande = await DemandeBoutique.findById(req.params.id);
        if (!demande) {
            return res.fail('Demande non trouvée', 404);
        }

        demande.statut = statut;
        demande.motifRefus = statut === 'refusee' ? motifRefus || null : null;
        await demande.save();

        return res.success(demande, 'Statut mis à jour');
    } catch (error) {
        next(error);
    }
};
