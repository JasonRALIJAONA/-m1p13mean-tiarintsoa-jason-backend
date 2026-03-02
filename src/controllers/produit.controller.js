const { validationResult } = require('express-validator');
const Produit = require('../models/Produit');
const Boutique = require('../models/Boutique');
const { getImageUrl, deleteImageFile } = require('../middlewares/upload.middleware');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Verify that the authenticated user owns the boutique with the given ID.
 * Returns the boutique document or null.
 */
async function verifyBoutiqueOwnership(boutiqueId, userId) {
  return Boutique.findOne({ _id: boutiqueId, userId });
}

// ─── Public routes ───────────────────────────────────────────────────────────

/**
 * GET /api/produits
 * Retourne tous les produits (public).
 */
exports.getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.find()
      .populate('boutiqueId', 'nom logo')
      .sort({ createdAt: -1 });
    res.success(produits, 'Produits récupérés avec succès');
  } catch (error) {
    console.error('getAllProduits:', error);
    res.fail('Erreur lors de la récupération des produits', 500);
  }
};

/**
 * GET /api/produits/boutique/:boutiqueId
 * Retourne les produits d'une boutique donnée (public).
 */
exports.getProduitsByBoutique = async (req, res) => {
  try {
    const produits = await Produit.find({ boutiqueId: req.params.boutiqueId })
      .populate('boutiqueId', 'nom logo')
      .sort({ enAvant: -1, createdAt: -1 });
    res.success(produits, 'Produits de la boutique récupérés');
  } catch (error) {
    console.error('getProduitsByBoutique:', error);
    res.fail('Erreur lors de la récupération des produits', 500);
  }
};

/**
 * GET /api/produits/:id
 * Retourne un produit par ID (public).
 */
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id).populate('boutiqueId', 'nom logo');
    if (!produit) return res.fail('Produit non trouvé', 404);
    res.success(produit, 'Produit récupéré');
  } catch (error) {
    console.error('getProduitById:', error);
    res.fail('Erreur lors de la récupération du produit', 500);
  }
};

// ─── Protected routes (boutique owner) ───────────────────────────────────────

/**
 * GET /api/produits/mes-produits
 * Retourne tous les produits des boutiques appartenant à l'utilisateur connecté.
 */
exports.getMesProduits = async (req, res) => {
  try {
    const mesBoutiques = await Boutique.find({ userId: req.user.userId }).select('_id');
    const boutiqueIds = mesBoutiques.map((b) => b._id);

    const produits = await Produit.find({ boutiqueId: { $in: boutiqueIds } })
      .populate('boutiqueId', 'nom logo')
      .sort({ createdAt: -1 });

    res.success(produits, 'Mes produits récupérés');
  } catch (error) {
    console.error('getMesProduits:', error);
    res.fail('Erreur lors de la récupération de vos produits', 500);
  }
};

/**
 * POST /api/produits
 * Crée un nouveau produit pour une boutique appartenant à l'utilisateur connecté.
 */
exports.createProduit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

    const { boutiqueId, nom, description, prix, enAvant } = req.body;

    const boutique = await verifyBoutiqueOwnership(boutiqueId, req.user.userId);
    if (!boutique) return res.fail('Boutique non trouvée ou accès refusé', 403);

    const imageUrl = req.file ? getImageUrl(req.file) : '';

    const produit = await Produit.create({
      boutiqueId,
      nom,
      description: description || '',
      prix: parseFloat(prix),
      enAvant: enAvant === 'true' || enAvant === true,
      image: imageUrl,
    });

    res.success(produit, 'Produit créé avec succès', 201);
  } catch (error) {
    console.error('createProduit:', error);
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    res.fail(error.message || 'Erreur lors de la création du produit', 500);
  }
};

/**
 * PUT /api/produits/:id
 * Met à jour un produit appartenant à l'utilisateur connecté.
 */
exports.updateProduit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.fail('Produit non trouvé', 404);

    const boutique = await verifyBoutiqueOwnership(produit.boutiqueId, req.user.userId);
    if (!boutique) return res.fail('Accès refusé', 403);

    const { nom, description, prix, enAvant } = req.body;
    const updateData = {};

    if (nom !== undefined) updateData.nom = nom;
    if (description !== undefined) updateData.description = description;
    if (prix !== undefined) updateData.prix = parseFloat(prix);
    if (enAvant !== undefined) updateData.enAvant = enAvant === 'true' || enAvant === true;

    if (req.file) {
      // Delete old image if it exists
      if (produit.image) deleteImageFile(produit.image);
      updateData.image = getImageUrl(req.file);
    }

    const updated = await Produit.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('boutiqueId', 'nom logo');

    res.success(updated, 'Produit mis à jour avec succès');
  } catch (error) {
    console.error('updateProduit:', error);
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    res.fail(error.message || 'Erreur lors de la mise à jour du produit', 500);
  }
};

/**
 * DELETE /api/produits/:id
 * Supprime un produit appartenant à l'utilisateur connecté.
 */
exports.deleteProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.fail('Produit non trouvé', 404);

    const boutique = await verifyBoutiqueOwnership(produit.boutiqueId, req.user.userId);
    if (!boutique) return res.fail('Accès refusé', 403);

    if (produit.image) deleteImageFile(produit.image);
    await Produit.findByIdAndDelete(req.params.id);

    res.success(null, 'Produit supprimé avec succès');
  } catch (error) {
    console.error('deleteProduit:', error);
    res.fail('Erreur lors de la suppression du produit', 500);
  }
};
