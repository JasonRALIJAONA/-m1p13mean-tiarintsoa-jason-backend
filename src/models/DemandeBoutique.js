const mongoose = require('mongoose');

/**
 * DemandeBoutique — slot location request submitted by a boutique-role user.
 *
 * Two creation modes:
 *  1. boutiqueExistanteId is set  → shop info is copied from the existing Boutique
 *     (nomBoutique, categorieId, etc. are still stored here for audit).
 *  2. boutiqueExistanteId is null → all shop fields below are required.
 *
 * On acceptance the admin either reuses the existing Boutique (mode 1) or
 * creates a new one (mode 2) and assigns the Emplacement automatically.
 */
const demandeBoutiqueSchema = new mongoose.Schema(
    {
        // ── Who submitted the request ──────────────────────────────────────
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'L\'utilisateur est requis']
        },

        // ── Optional reference to a pre-existing shop ──────────────────────
        boutiqueExistanteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Boutique',
            default: null
        },

        // ── Embedded shop information (required when boutiqueExistanteId is null) ──
        nomBoutique: {
            type: String,
            default: null,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        categorieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categorie',
            default: null
        },
        logo: {
            type: String,
            default: ''
        },
        heureOuverture: {
            type: String,
            default: null,
            validate: {
                validator: (v) => v === null || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
                message: 'L\'heure d\'ouverture doit être au format HH:MM'
            }
        },
        heureFermeture: {
            type: String,
            default: null,
            validate: {
                validator: (v) => v === null || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
                message: 'L\'heure de fermeture doit être au format HH:MM'
            }
        },
        joursOuverture: [{
            type: String,
            enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
        }],

        // ── Requested slot ────────────────────────────────────────────────
        emplacementSouhaiteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Emplacement',
            required: [true, 'L\'emplacement souhaité est requis']
        },
        dateDebutSouhaitee: {
            type: Date,
            required: [true, 'La date de début souhaitée est requise']
        },
        dateFinSouhaitee: {
            type: Date,
            default: null
        },

        // ── Decision ──────────────────────────────────────────────────────
        statut: { type: String, enum: ['en_attente', 'acceptee', 'refusee'], default: 'en_attente' },
        motifRefus: { type: String, default: null },
        // Populated on acceptance when the Boutique document is created or reused
        boutiqueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Boutique',
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('DemandeBoutique', demandeBoutiqueSchema);
