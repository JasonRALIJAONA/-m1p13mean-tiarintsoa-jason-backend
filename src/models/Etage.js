const mongoose = require('mongoose');

const etageSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de l\'étage est requis'],
    trim: true
  },
  niveau: {
    type: Number,
    required: [true, 'Le niveau de l\'étage est requis'],
    unique: true
  },
  planImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Etage', etageSchema);
