const mongoose = require('mongoose');

/**
 * DemandeBoutique — slot location request submitted by a boutique-role user.
 * Embeds all shop information at request time so no Boutique document is needed
 * before the request is validated. On acceptance the admin creates the Boutique
 * and assigns the Emplacement automatically.
 */
const demandeBoutiqueSchema = new mongoose.Schema(
    {
        // ── Who submitted the request ──────────────────────────────────────
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'L\'utilisateur est requis']
        },

        // ── Embedded shop information ──────────────────────────────────────
        nomBoutique: {
            type: String,
            required: [true, 'Le nom de la boutique est requis'],
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        categorieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categorie',
            required: [true, 'La catégorie est requise']
        },
        heureOuverture: {
            type: String,
            required: [true, 'L\'heure d\'ouverture est requise'],
            validate: {
                validator: (v) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
                message: 'L\'heure d\'ouverture doit être au format HH:MM'
            }
        },
        heureFermeture: {
            type: String,
            required: [true, 'L\'heure de fermeture est requise'],
            validate: {
                validator: (v) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
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
        // Populated on acceptance when the Boutique document is created
        boutiqueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Boutique',
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('DemandeBoutique', demandeBoutiqueSchema);
