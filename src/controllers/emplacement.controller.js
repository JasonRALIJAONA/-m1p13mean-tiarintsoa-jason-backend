const Emplacement = require('../models/Emplacement');

/**
 * Get all emplacements with populated references
 */
exports.getAllEmplacements = async (req, res) => {
  try {
    const emplacements = await Emplacement.find()
      .populate('etageId', 'nom niveau')
      .populate({
        path: 'boutiqueId',
        populate: {
          path: 'categorieId',
          select: 'nom couleur icon'
        }
      })
      .sort({ numero: 1 });
    
    res.success(emplacements, 'Emplacements récupérés avec succès');
  } catch (error) {
    console.error('Error fetching emplacements:', error);
    res.fail('Erreur lors de la récupération des emplacements', 500);
  }
};

/**
 * Get emplacements by floor
 */
exports.getEmplacementsByEtage = async (req, res) => {
  try {
    const emplacements = await Emplacement.find({ etageId: req.params.etageId })
      .populate('etageId', 'nom niveau')
      .populate({
        path: 'boutiqueId',
        populate: {
          path: 'categorieId',
          select: 'nom couleur icon'
        }
      })
      .sort({ numero: 1 });
    
    res.success(emplacements, 'Emplacements récupérés avec succès');
  } catch (error) {
    console.error('Error fetching emplacements by etage:', error);
    res.fail('Erreur lors de la récupération des emplacements', 500);
  }
};

/**
 * Get a single emplacement by ID
 */
exports.getEmplacementById = async (req, res) => {
  try {
    const emplacement = await Emplacement.findById(req.params.id)
      .populate('etageId', 'nom niveau')
      .populate({
        path: 'boutiqueId',
        populate: {
          path: 'categorieId',
          select: 'nom couleur icon'
        }
      });
    
    if (!emplacement) {
      return res.fail('Emplacement non trouvé', 404);
    }
    
    res.success(emplacement, 'Emplacement récupéré avec succès');
  } catch (error) {
    console.error('Error fetching emplacement:', error);
    res.fail('Erreur lors de la récupération de l\'emplacement', 500);
  }
};

/**
 * Get available emplacements (libre)
 */
exports.getAvailableEmplacements = async (req, res) => {
  try {
    const emplacements = await Emplacement.find({ statut: 'libre' })
      .populate('etageId', 'nom niveau')
      .sort({ numero: 1 });
    
    res.success(emplacements, 'Emplacements disponibles récupérés avec succès');
  } catch (error) {
    console.error('Error fetching available emplacements:', error);
    res.fail('Erreur lors de la récupération des emplacements disponibles', 500);
  }
};

/**
 * Create a new emplacement
 */
exports.createEmplacement = async (req, res) => {
  try {
    const emplacement = new Emplacement(req.body);
    await emplacement.save();
    
    const populatedEmplacement = await Emplacement.findById(emplacement._id)
      .populate('etageId', 'nom niveau')
      .populate('boutiqueId');
    
    res.success(populatedEmplacement, 'Emplacement créé avec succès', 201);
  } catch (error) {
    console.error('Error creating emplacement:', error);
    
    if (error.code === 11000) {
      return res.fail('Un emplacement avec ce numéro existe déjà', 400);
    }
    
    res.fail(error.message || 'Erreur lors de la création de l\'emplacement', 500);
  }
};

/**
 * Update an emplacement
 */
exports.updateEmplacement = async (req, res) => {
  try {
    const emplacement = await Emplacement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('etageId', 'nom niveau')
      .populate('boutiqueId');
    
    if (!emplacement) {
      return res.fail('Emplacement non trouvé', 404);
    }
    
    res.success(emplacement, 'Emplacement mis à jour avec succès');
  } catch (error) {
    console.error('Error updating emplacement:', error);
    res.fail(error.message || 'Erreur lors de la mise à jour de l\'emplacement', 500);
  }
};

/**
 * Delete an emplacement
 */
exports.deleteEmplacement = async (req, res) => {
  try {
    const emplacement = await Emplacement.findByIdAndDelete(req.params.id);
    
    if (!emplacement) {
      return res.fail('Emplacement non trouvé', 404);
    }
    
    res.success(null, 'Emplacement supprimé avec succès');
  } catch (error) {
    console.error('Error deleting emplacement:', error);
    res.fail('Erreur lors de la suppression de l\'emplacement', 500);
  }
};
