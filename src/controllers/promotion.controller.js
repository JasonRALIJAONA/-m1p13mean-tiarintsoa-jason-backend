const { validationResult } = require('express-validator');
const Promotion = require('../models/Promotion');
const Boutique = require('../models/Boutique');
const { getImageUrl, deleteImageFile } = require('../middlewares/upload.middleware');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function verifyBoutiqueOwnership(boutiqueId, userId) {
  return Boutique.findOne({ _id: boutiqueId, userId });
}

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * GET /api/promotions
 * Retourne toutes les promotions (public).
 */
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('boutiqueId', 'nom logo')
      .sort({ dateDebut: -1 });
    res.success(promotions, 'Promotions récupérées avec succès');
  } catch (error) {
    console.error('getAllPromotions:', error);
    res.fail('Erreur lors de la récupération des promotions', 500);
  }
};

/**
 * GET /api/promotions/boutique/:boutiqueId
 * Retourne les promotions d'une boutique donnée (public).
 */
exports.getPromotionsByBoutique = async (req, res) => {
  try {
    const promotions = await Promotion.find({ boutiqueId: req.params.boutiqueId })
      .populate('boutiqueId', 'nom logo')
      .sort({ dateDebut: -1 });
    res.success(promotions, 'Promotions de la boutique récupérées');
  } catch (error) {
    console.error('getPromotionsByBoutique:', error);
    res.fail('Erreur lors de la récupération des promotions', 500);
  }
};

/**
 * GET /api/promotions/actives
 * Retourne les promotions actuellement actives (dateDebut <= now <= dateFin), public.
 * Query param optionnel: boutiqueId
 */
exports.getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const filter = {
      dateDebut: { $lte: now },
      dateFin: { $gte: now },
    };
    if (req.query.boutiqueId) filter.boutiqueId = req.query.boutiqueId;

    const promotions = await Promotion.find(filter)
      .populate('boutiqueId', 'nom logo')
      .sort({ dateDebut: -1 });
    res.success(promotions, 'Promotions actives récupérées');
  } catch (error) {
    console.error('getActivePromotions:', error);
    res.fail('Erreur lors de la récupération des promotions actives', 500);
  }
};

/**
 * GET /api/promotions/:id
 * Retourne une promotion par ID (public).
 */
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id).populate('boutiqueId', 'nom logo');
    if (!promotion) return res.fail('Promotion non trouvée', 404);
    res.success(promotion, 'Promotion récupérée');
  } catch (error) {
    console.error('getPromotionById:', error);
    res.fail('Erreur lors de la récupération de la promotion', 500);
  }
};

// ─── Protected routes (boutique owner) ───────────────────────────────────────

/**
 * GET /api/promotions/mes-promotions
 * Retourne toutes les promotions des boutiques appartenant à l'utilisateur connecté.
 */
exports.getMesPromotions = async (req, res) => {
  try {
    const mesBoutiques = await Boutique.find({ userId: req.user.id }).select('_id');
    const boutiqueIds = mesBoutiques.map((b) => b._id);

    const promotions = await Promotion.find({ boutiqueId: { $in: boutiqueIds } })
      .populate('boutiqueId', 'nom logo')
      .sort({ createdAt: -1 });

    res.success(promotions, 'Mes promotions récupérées');
  } catch (error) {
    console.error('getMesPromotions:', error);
    res.fail('Erreur lors de la récupération de vos promotions', 500);
  }
};

/**
 * POST /api/promotions
 * Crée une nouvelle promotion pour une boutique appartenant à l'utilisateur connecté.
 */
exports.createPromotion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

    const { boutiqueId, titre, description, dateDebut, dateFin, reduction } = req.body;

    const boutique = await verifyBoutiqueOwnership(boutiqueId, req.user.id);
    if (!boutique) return res.fail('Boutique non trouvée ou accès refusé', 403);

    const imageUrl = req.file ? getImageUrl(req.file) : '';

    const promotion = await Promotion.create({
      boutiqueId,
      titre,
      description: description || '',
      dateDebut,
      dateFin,
      image: imageUrl,
      reduction: reduction != null && reduction !== '' ? parseFloat(reduction) : null,
    });

    res.success(promotion, 'Promotion créée avec succès', 201);
  } catch (error) {
    console.error('createPromotion:', error);
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    res.fail(error.message || 'Erreur lors de la création de la promotion', 500);
  }
};

/**
 * PUT /api/promotions/:id
 * Met à jour une promotion appartenant à l'utilisateur connecté.
 */
exports.updatePromotion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.fail('Promotion non trouvée', 404);

    const boutique = await verifyBoutiqueOwnership(promotion.boutiqueId, req.user.id);
    if (!boutique) return res.fail('Accès refusé', 403);

    const { titre, description, dateDebut, dateFin, reduction } = req.body;
    const updateData = {};

    if (titre !== undefined) updateData.titre = titre;
    if (description !== undefined) updateData.description = description;
    if (dateDebut !== undefined) updateData.dateDebut = dateDebut;
    if (dateFin !== undefined) updateData.dateFin = dateFin;
    if (reduction !== undefined) {
      updateData.reduction = reduction != null && reduction !== '' ? parseFloat(reduction) : null;
    }

    if (req.file) {
      if (promotion.image) deleteImageFile(promotion.image);
      updateData.image = getImageUrl(req.file);
    }

    const updated = await Promotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('boutiqueId', 'nom logo');

    res.success(updated, 'Promotion mise à jour avec succès');
  } catch (error) {
    console.error('updatePromotion:', error);
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    res.fail(error.message || 'Erreur lors de la mise à jour de la promotion', 500);
  }
};

/**
 * DELETE /api/promotions/:id
 * Supprime une promotion appartenant à l'utilisateur connecté.
 */
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.fail('Promotion non trouvée', 404);

    const boutique = await verifyBoutiqueOwnership(promotion.boutiqueId, req.user.id);
    if (!boutique) return res.fail('Accès refusé', 403);

    if (promotion.image) deleteImageFile(promotion.image);
    await Promotion.findByIdAndDelete(req.params.id);

    res.success(null, 'Promotion supprimée avec succès');
  } catch (error) {
    console.error('deletePromotion:', error);
    res.fail('Erreur lors de la suppression de la promotion', 500);
  }
};
