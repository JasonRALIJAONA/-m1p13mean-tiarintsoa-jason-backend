const mongoose = require('mongoose');

const emplacementSchema = new mongoose.Schema({
  etageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etage',
    required: [true, 'L\'étage est requis']
  },
  numero: {
    type: String,
    required: [true, 'Le numéro d\'emplacement est requis'],
    unique: true,
    trim: true
  },
  coordonnees: {
    x: { 
      type: Number, 
      required: [true, 'La coordonnée X est requise']
    },
    y: { 
      type: Number, 
      required: [true, 'La coordonnée Y est requise']
    },
    width: { 
      type: Number, 
      required: [true, 'La largeur est requise'],
      min: [1, 'La largeur doit être positive']
    },
    height: { 
      type: Number, 
      required: [true, 'La hauteur est requise'],
      min: [1, 'La hauteur doit être positive']
    }
  },
  statut: {
    type: String,
    enum: ['libre', 'occupe'],
    default: 'libre'
  },
  boutiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    default: null
  }
}, {
  timestamps: true
});

// Validation: if statut is 'occupe', boutiqueId must be set
emplacementSchema.pre('save', function(next) {
  if (this.statut === 'occupe' && !this.boutiqueId) {
    next(new Error('Un emplacement occupé doit avoir une boutique associée'));
  } else if (this.statut === 'libre' && this.boutiqueId) {
    this.boutiqueId = null; // Auto-clear boutique if status is libre
  }
  next();
});

module.exports = mongoose.model('Emplacement', emplacementSchema);
