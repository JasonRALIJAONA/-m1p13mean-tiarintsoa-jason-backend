const mongoose = require('mongoose');

const demandeBoutiqueSchema = new mongoose.Schema(
    {
        nom: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        categorieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: true },
        logo: { type: String, default: null },
        emplacementSouhaiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emplacement', default: null },
        contactNom: { type: String, required: true, trim: true },
        contactPrenom: { type: String, required: true, trim: true },
        contactEmail: { type: String, required: true, lowercase: true, trim: true },
        contactTelephone: { type: String, required: true, trim: true },
        statut: { type: String, enum: ['en_attente', 'acceptee', 'refusee'], default: 'en_attente' },
        motifRefus: { type: String, default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model('DemandeBoutique', demandeBoutiqueSchema);
