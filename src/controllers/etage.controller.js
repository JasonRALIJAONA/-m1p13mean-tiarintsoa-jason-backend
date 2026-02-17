const Etage = require('../models/Etage');

/**
 * Get all floors sorted by level
 */
exports.getAllEtages = async (req, res) => {
  try {
    const etages = await Etage.find().sort({ niveau: 1 });
    res.success(etages, 'Étages récupérés avec succès');
  } catch (error) {
    console.error('Error fetching etages:', error);
    res.fail('Erreur lors de la récupération des étages', 500);
  }
};

/**
 * Get a single floor by ID
 */
exports.getEtageById = async (req, res) => {
  try {
    const etage = await Etage.findById(req.params.id);
    
    if (!etage) {
      return res.fail('Étage non trouvé', 404);
    }
    
    res.success(etage, 'Étage récupéré avec succès');
  } catch (error) {
    console.error('Error fetching etage:', error);
    res.fail('Erreur lors de la récupération de l\'étage', 500);
  }
};

/**
 * Create a new floor
 */
exports.createEtage = async (req, res) => {
  try {
    const etage = new Etage(req.body);
    await etage.save();
    
    res.success(etage, 'Étage créé avec succès', 201);
  } catch (error) {
    console.error('Error creating etage:', error);
    
    if (error.code === 11000) {
      return res.fail('Un étage avec ce niveau existe déjà', 400);
    }
    
    res.fail(error.message || 'Erreur lors de la création de l\'étage', 500);
  }
};

/**
 * Update a floor
 */
exports.updateEtage = async (req, res) => {
  try {
    const etage = await Etage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!etage) {
      return res.fail('Étage non trouvé', 404);
    }
    
    res.success(etage, 'Étage mis à jour avec succès');
  } catch (error) {
    console.error('Error updating etage:', error);
    res.fail(error.message || 'Erreur lors de la mise à jour de l\'étage', 500);
  }
};

/**
 * Delete a floor
 */
exports.deleteEtage = async (req, res) => {
  try {
    const etage = await Etage.findByIdAndDelete(req.params.id);
    
    if (!etage) {
      return res.fail('Étage non trouvé', 404);
    }
    
    res.success(null, 'Étage supprimé avec succès');
  } catch (error) {
    console.error('Error deleting etage:', error);
    res.fail('Erreur lors de la suppression de l\'étage', 500);
  }
};
