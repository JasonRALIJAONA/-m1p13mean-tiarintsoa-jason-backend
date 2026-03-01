const { validationResult } = require('express-validator');
const DemandeBoutique = require('../models/DemandeBoutique');
const Boutique = require('../models/Boutique');
const Emplacement = require('../models/Emplacement');
const LocationEmplacement = require('../models/LocationEmplacement');

/** Shared populate spec for all reads */
const POPULATE = [
    { path: 'userId', select: 'nom prenom email' },
    { path: 'categorieId', select: 'nom couleur icon' },
    { path: 'boutiqueId', select: 'nom logo' },
    { path: 'emplacementSouhaiteId', select: 'numero statut etageId coordonnees', populate: { path: 'etageId', select: 'nom niveau' } }
];

/**
 * POST /api/demandes-boutiques
 * Authenticated boutique user submits a slot request with embedded shop info.
 * No Boutique document is needed at this stage.
 */
exports.createDemande = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.fail('Validation échouée', 400, errors.array());
        }

        const {
            nomBoutique, description, categorieId,
            heureOuverture, heureFermeture, joursOuverture,
            emplacementSouhaiteId, dateDebutSouhaitee, dateFinSouhaitee
        } = req.body;

        // Verify the targeted emplacement exists
        const emplacement = await Emplacement.findById(emplacementSouhaiteId);
        if (!emplacement) {
            return res.fail('Emplacement introuvable', 404);
        }

        // Check for date-range overlap with existing active locations on this slot
        const overlapFilter = {
            emplacementId: emplacementSouhaiteId,
            $or: [
                { dateFin: null },
                { dateFin: { $gte: new Date(dateDebutSouhaitee) } }
            ]
        };
        if (dateFinSouhaitee) {
            overlapFilter.dateDebut = { $lte: new Date(dateFinSouhaitee) };
        }
        const overlap = await LocationEmplacement.findOne(overlapFilter);
        if (overlap) {
            return res.fail('Cet emplacement est déjà occupé sur cette période', 409);
        }

        // Prevent duplicate pending requests from the same user for the same emplacement
        const existing = await DemandeBoutique.findOne({
            userId: req.user.userId,
            emplacementSouhaiteId,
            statut: 'en_attente'
        });
        if (existing) {
            return res.fail('Une demande en attente existe déjà pour cet emplacement', 409);
        }

        const demande = await DemandeBoutique.create({
            userId: req.user.userId,
            nomBoutique,
            description: description || '',
            categorieId,
            heureOuverture,
            heureFermeture,
            joursOuverture: joursOuverture || [],
            emplacementSouhaiteId,
            dateDebutSouhaitee,
            dateFinSouhaitee: dateFinSouhaitee || null
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
 * Boutique: list requests submitted by the authenticated user.
 */
exports.getMesDemandes = async (req, res, next) => {
    try {
        const demandes = await DemandeBoutique.find({ userId: req.user.userId })
            .populate(POPULATE)
            .sort({ createdAt: -1 });
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

        // On acceptance: create the Boutique from embedded info and assign the emplacement
        if (statut === 'acceptee') {
            const boutique = await Boutique.create({
                userId: demande.userId,
                nom: demande.nomBoutique,
                description: demande.description,
                categorieId: demande.categorieId,
                heureOuverture: demande.heureOuverture,
                heureFermeture: demande.heureFermeture,
                joursOuverture: demande.joursOuverture,
                statut: 'validee'
            });

            // Create the location record (slot occupancy is now derived from this)
            await LocationEmplacement.create({
                demandeId: demande._id,
                boutiqueId: boutique._id,
                emplacementId: demande.emplacementSouhaiteId,
                userId: demande.userId,
                dateDebut: demande.dateDebutSouhaitee,
                dateFin: demande.dateFinSouhaitee || null
            });

            // Link the created boutique back to the demand
            demande.boutiqueId = boutique._id;
            await demande.save();
        }

        const populated = await DemandeBoutique.findById(demande._id).populate(POPULATE);
        return res.success(populated, 'Statut mis à jour');
    } catch (error) {
        next(error);
    }
};
