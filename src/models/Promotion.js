const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boutique',
      required: [true, 'La boutique est requise'],
    },
    titre: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dateDebut: {
      type: Date,
      required: [true, 'La date de début est requise'],
    },
    dateFin: {
      type: Date,
      required: [true, 'La date de fin est requise'],
    },
    image: {
      type: String,
      default: '',
    },
    reduction: {
      type: Number,
      min: [0, 'La réduction ne peut pas être négative'],
      max: [100, 'La réduction ne peut pas dépasser 100%'],
      default: null,
    },
  },
  { timestamps: true }
);

promotionSchema.index({ boutiqueId: 1 });
promotionSchema.index({ dateDebut: 1, dateFin: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
