const mongoose = require('mongoose');

const boutiqueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur propriétaire est requis']
  },
  nom: {
    type: String,
    required: [true, 'Le nom de la boutique est requis'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  categorieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
    required: [true, 'La catégorie est requise']
  },
  logo: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  heureOuverture: {
    type: String,
    required: [true, 'L\'heure d\'ouverture est requise'],
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'L\'heure d\'ouverture doit être au format HH:MM'
    }
  },
  heureFermeture: {
    type: String,
    required: [true, 'L\'heure de fermeture est requise'],
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'L\'heure de fermeture doit être au format HH:MM'
    }
  },
  joursOuverture: [{
    type: String,
    enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
  }],
  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'rejetee'],
    default: 'en_attente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Boutique', boutiqueSchema);
