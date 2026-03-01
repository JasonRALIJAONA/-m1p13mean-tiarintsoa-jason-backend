const mongoose = require('mongoose');

const locationEmplacementSchema = new mongoose.Schema(
    {
        demandeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DemandeBoutique',
            required: true
        },
        boutiqueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Boutique',
            required: true
        },
        emplacementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Emplacement',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        dateDebut: {
            type: Date,
            required: true
        },
        dateFin: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// Compound index for efficient date-overlap queries on a given slot
locationEmplacementSchema.index({ emplacementId: 1, dateDebut: 1, dateFin: 1 });
locationEmplacementSchema.index({ boutiqueId: 1 });
locationEmplacementSchema.index({ userId: 1 });

module.exports = mongoose.model('LocationEmplacement', locationEmplacementSchema);
