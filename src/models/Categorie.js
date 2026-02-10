const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema(
    {
        nom: { type: String, required: true, trim: true, unique: true },
        description: { type: String, default: null, trim: true },
        icone: { type: String, default: null }
    },
    { timestamps: true }
);

categorieSchema.index({ nom: 1 }, { unique: true });

module.exports = mongoose.model('Categorie', categorieSchema);
