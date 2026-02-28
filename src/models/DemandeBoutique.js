const mongoose = require('mongoose');

/**
 * DemandeBoutique — slot location request submitted by an approved shop account.
 * A boutique user selects which of their boutiques is requesting a specific available emplacement.
 * On acceptance the emplacement is automatically marked as occupied.
 */
const demandeBoutiqueSchema = new mongoose.Schema(
    {
        boutiqueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Boutique',
            required: [true, 'La boutique est requise']
        },
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
        statut: { type: String, enum: ['en_attente', 'acceptee', 'refusee'], default: 'en_attente' },
        motifRefus: { type: String, default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model('DemandeBoutique', demandeBoutiqueSchema);
