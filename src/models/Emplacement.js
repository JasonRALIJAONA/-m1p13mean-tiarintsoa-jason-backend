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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Emplacement', emplacementSchema);
