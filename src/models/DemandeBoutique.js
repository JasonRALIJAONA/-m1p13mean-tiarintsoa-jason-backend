const mongoose = require('mongoose');

/**
 * DemandeBoutique — slot location request submitted by an approved shop account.
 * An authenticated boutique user requests a specific available emplacement.
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
        statut: { type: String, enum: ['en_attente', 'acceptee', 'refusee'], default: 'en_attente' },
        motifRefus: { type: String, default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model('DemandeBoutique', demandeBoutiqueSchema);
