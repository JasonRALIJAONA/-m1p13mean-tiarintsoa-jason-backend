const Emplacement = require('../models/Emplacement');
const LocationEmplacement = require('../models/LocationEmplacement');

const BOUTIQUE_POPULATE = {
    path: 'boutiqueId',
    select: 'nom logo description heureOuverture heureFermeture joursOuverture categorieId statut',
    populate: { path: 'categorieId', select: 'nom couleur icon' }
};

/**
 * GET /api/locations/actives?etageId=
 * Public: return all active locations (started, not yet ended) for a given floor.
 * "Active" means: dateDebut <= now AND (dateFin IS NULL OR dateFin >= now)
 */
exports.getActiveByEtage = async (req, res, next) => {
    try {
        const { etageId } = req.query;
        if (!etageId) {
            return res.fail('Le paramètre etageId est requis', 400);
        }

        const now = new Date();

        // Step 1: get all slot IDs for this floor
        const emplacements = await Emplacement.find({ etageId }).select('_id');
        const emplacementIds = emplacements.map(e => e._id);

        // Step 2: find active locations for those slots
        const activeLocations = await LocationEmplacement.find({
            emplacementId: { $in: emplacementIds },
            dateDebut: { $lte: now },
            $or: [
                { dateFin: null },
                { dateFin: { $gte: now } }
            ]
        })
            .populate(BOUTIQUE_POPULATE)
            .populate({ path: 'emplacementId', select: 'numero coordonnees etageId' });

        return res.success(activeLocations, 'Locations actives');
    } catch (error) {
        next(error);
    }
};
