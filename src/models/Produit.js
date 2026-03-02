const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
  {
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boutique',
      required: [true, 'La boutique est requise'],
    },
    nom: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    image: {
      type: String,
      default: '',
    },
    enAvant: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

produitSchema.index({ boutiqueId: 1 });

module.exports = mongoose.model('Produit', produitSchema);
