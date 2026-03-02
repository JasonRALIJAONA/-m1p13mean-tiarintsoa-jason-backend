const mongoose = require('mongoose');

const visiteSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['site', 'boutique'],
            required: true
        },
        boutiqueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Boutique',
            default: null
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

visiteSchema.pre('validate', function () {
    if (this.type === 'boutique' && !this.boutiqueId) {
        throw new Error('boutiqueId requis pour type boutique');
    }
});

visiteSchema.index({ type: 1, createdAt: -1 });
visiteSchema.index({ boutiqueId: 1, createdAt: -1 });

module.exports = mongoose.model('Visite', visiteSchema);
