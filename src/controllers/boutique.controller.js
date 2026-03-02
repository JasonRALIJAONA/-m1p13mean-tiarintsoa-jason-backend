const Boutique = require('../models/Boutique');

/**
 * GET /boutiques/mes-boutiques
 * Returns all shops owned by the authenticated user.
 */
exports.getMesBoutiques = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ userId: req.user.userId })
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email')
      .sort({ nom: 1 });

    res.success(boutiques, 'Mes boutiques récupérées avec succès');
  } catch (error) {
    console.error('Error fetching user boutiques:', error);
    res.fail('Erreur lors de la récupération de vos boutiques', 500);
  }
};

/**
 * Get all shops with populated references
 */
exports.getAllBoutiques = async (req, res) => {
  try {
    const boutiques = await Boutique.find()
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email')
      .sort({ nom: 1 });
    
    res.success(boutiques, 'Boutiques récupérées avec succès');
  } catch (error) {
    console.error('Error fetching boutiques:', error);
    res.fail('Erreur lors de la récupération des boutiques', 500);
  }
};

/**
 * Get a single shop by ID with populated references
 */
exports.getBoutiqueById = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email');
    
    if (!boutique) {
      return res.fail('Boutique non trouvée', 404);
    }
    
    res.success(boutique, 'Boutique récupérée avec succès');
  } catch (error) {
    console.error('Error fetching boutique:', error);
    res.fail('Erreur lors de la récupération de la boutique', 500);
  }
};

/**
 * Get shops by category
 */
exports.getBoutiquesByCategorie = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ categorieId: req.params.categorieId })
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email')
      .sort({ nom: 1 });
    
    res.success(boutiques, 'Boutiques récupérées avec succès');
  } catch (error) {
    console.error('Error fetching boutiques by category:', error);
    res.fail('Erreur lors de la récupération des boutiques', 500);
  }
};

/**
 * Get shops by status
 */
exports.getBoutiquesByStatut = async (req, res) => {
  try {
    const { statut } = req.params;
    
    if (!['en_attente', 'validee', 'rejetee'].includes(statut)) {
      return res.fail('Statut invalide', 400);
    }
    
    const boutiques = await Boutique.find({ statut })
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email')
      .sort({ createdAt: -1 });
    
    res.success(boutiques, 'Boutiques récupérées avec succès');
  } catch (error) {
    console.error('Error fetching boutiques by status:', error);
    res.fail('Erreur lors de la récupération des boutiques', 500);
  }
};

/**
 * PUT /boutiques/mes-boutiques/:id
 * Updates a shop owned by the authenticated boutique user.
 * Ownership is verified before applying any changes.
 */
exports.updateMaBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!boutique) {
      return res.fail('Boutique non trouvée ou accès refusé', 404);
    }

    // Prevent overwriting admin-managed fields
    const { statut, userId, ...updates } = req.body;

    const updated = await Boutique.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email');

    res.success(updated, 'Boutique mise à jour avec succès');
  } catch (error) {
    console.error('Error updating boutique (owner):', error);
    res.fail(error.message || 'Erreur lors de la mise à jour de la boutique', 500);
  }
};

/**
 * POST /boutiques/mes-boutiques
 * Creates a new shop owned by the authenticated boutique user.
 * The userId is automatically set from the JWT token.
 */
exports.createMaBoutique = async (req, res) => {
  try {
    const boutique = new Boutique({
      ...req.body,
      userId: req.user.userId,
      statut: 'en_attente',
    });
    await boutique.save();

    const populatedBoutique = await Boutique.findById(boutique._id)
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email');

    res.success(populatedBoutique, 'Boutique créée avec succès', 201);
  } catch (error) {
    console.error('Error creating boutique (owner):', error);
    res.fail(error.message || 'Erreur lors de la création de la boutique', 500);
  }
};

/**
 * Create a new shop
 */
exports.createBoutique = async (req, res) => {
  try {
    const boutique = new Boutique(req.body);
    await boutique.save();
    
    const populatedBoutique = await Boutique.findById(boutique._id)
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email');
    
    res.success(populatedBoutique, 'Boutique créée avec succès', 201);
  } catch (error) {
    console.error('Error creating boutique:', error);
    res.fail(error.message || 'Erreur lors de la création de la boutique', 500);
  }
};

/**
 * Update a shop
 */
exports.updateBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('categorieId', 'nom description icon couleur')
      .populate('userId', 'nom email');
    
    if (!boutique) {
      return res.fail('Boutique non trouvée', 404);
    }
    
    res.success(boutique, 'Boutique mise à jour avec succès');
  } catch (error) {
    console.error('Error updating boutique:', error);
    res.fail(error.message || 'Erreur lors de la mise à jour de la boutique', 500);
  }
};

/**
 * Delete a shop
 */
exports.deleteBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndDelete(req.params.id);
    
    if (!boutique) {
      return res.fail('Boutique non trouvée', 404);
    }
    
    res.success(null, 'Boutique supprimée avec succès');
  } catch (error) {
    console.error('Error deleting boutique:', error);
    res.fail('Erreur lors de la suppression de la boutique', 500);
  }
};
