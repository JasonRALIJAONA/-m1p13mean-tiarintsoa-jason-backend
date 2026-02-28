const { validationResult } = require('express-validator');
const DemandeBoutique = require('../models/DemandeBoutique');
const Boutique = require('../models/Boutique');
const Emplacement = require('../models/Emplacement');

/** Shared populate spec for all reads */
const POPULATE = [
    { path: 'boutiqueId', select: 'nom logo categorieId userId' },
    { path: 'emplacementSouhaiteId', select: 'numero statut etageId coordonnees', populate: { path: 'etageId', select: 'nom niveau' } }
];

/**
 * POST /api/demandes-boutiques
 * Authenticated boutique user submits a slot request.
 * boutiqueId is resolved server-side from req.user.
 */
exports.createDemande = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.fail('Validation échouée', 400, errors.array());
        }

        // Resolve the boutique that belongs to the authenticated user
        const boutique = await Boutique.findOne({ userId: req.user.userId });
        if (!boutique) {
            return res.fail('Aucune boutique associée à ce compte', 404);
        }

        // Verify the targeted emplacement is free
        const emplacement = await Emplacement.findById(req.body.emplacementSouhaiteId);
        if (!emplacement) {
            return res.fail('Emplacement introuvable', 404);
        }
        if (emplacement.statut !== 'libre') {
            return res.fail('Cet emplacement n\'est pas disponible', 409);
        }

        // Prevent duplicate pending requests for the same boutique
        const existing = await DemandeBoutique.findOne({ boutiqueId: boutique._id, statut: 'en_attente' });
        if (existing) {
            return res.fail('Une demande est déjà en cours pour cette boutique', 409);
        }

        const demande = await DemandeBoutique.create({
            boutiqueId: boutique._id,
            emplacementSouhaiteId: req.body.emplacementSouhaiteId
        });

        const populated = await DemandeBoutique.findById(demande._id).populate(POPULATE);
        return res.success(populated, 'Demande créée', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/demandes-boutiques
 * Admin: list all requests, optionally filtered by statut.
 */
exports.listDemandes = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.fail('Validation échouée', 400, errors.array());
        }

        const { statut } = req.query;
        const filter = statut ? { statut } : {};
        const demandes = await DemandeBoutique.find(filter).populate(POPULATE).sort({ createdAt: -1 });
        return res.success(demandes, 'Liste des demandes');
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/demandes-boutiques/mes-demandes
 * Boutique: list own requests.
 */
exports.getMesDemandes = async (req, res, next) => {
    try {
        const boutique = await Boutique.findOne({ userId: req.user.userId });
        if (!boutique) {
            return res.success([], 'Aucune boutique associée');
        }

        const demandes = await DemandeBoutique.find({ boutiqueId: boutique._id }).populate(POPULATE).sort({ createdAt: -1 });
        return res.success(demandes, 'Mes demandes');
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/demandes-boutiques/:id
 * Admin: get a single request.
 */
exports.getDemande = async (req, res, next) => {
    try {
        const demande = await DemandeBoutique.findById(req.params.id).populate(POPULATE);
        if (!demande) {
            return res.fail('Demande non trouvée', 404);
        }
        return res.success(demande, 'Demande');
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/demandes-boutiques/:id/statut
 * Admin: accept or reject a request.
 * On acceptance, auto-assigns the emplacement to the boutique.
 */
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
        if (demande.statut !== 'en_attente') {
            return res.fail('Cette demande a déjà été traitée', 400);
        }

        demande.statut = statut;
        demande.motifRefus = statut === 'refusee' ? (motifRefus || null) : null;
        await demande.save();

        // On acceptance: assign the emplacement to the boutique
        if (statut === 'acceptee') {
            await Emplacement.findByIdAndUpdate(
                demande.emplacementSouhaiteId,
                { boutiqueId: demande.boutiqueId, statut: 'occupe' }
            );
        }

        const populated = await DemandeBoutique.findById(demande._id).populate(POPULATE);
        return res.success(populated, 'Statut mis à jour');
    } catch (error) {
        next(error);
    }
};
