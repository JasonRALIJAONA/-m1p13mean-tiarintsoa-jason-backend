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
const categorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'pi-tag'
  },
  couleur: {
    type: String,
    default: '#000000',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'La couleur doit être au format hexadécimal (#RRGGBB)'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Categorie', categorieSchema);
