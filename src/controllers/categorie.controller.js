const { validationResult } = require('express-validator');
const Categorie = require('../models/Categorie');

exports.list = async (req, res, next) => {
    try {
        const categories = await Categorie.find().sort({ nom: 1 });
        return res.success(categories, 'Liste des catégories');
    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const categorie = await Categorie.findById(req.params.id);
        if (!categorie) return res.fail('Catégorie non trouvée', 404);
        return res.success(categorie, 'Catégorie');
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

        const { nom } = req.body;
        const exists = await Categorie.findOne({ nom: nom.trim() });
        if (exists) return res.fail('Nom déjà utilisé', 409);

        const categorie = await Categorie.create(req.body);
        return res.success(categorie, 'Catégorie créée', 201);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

        const { id } = req.params;
        const payload = req.body;

        if (payload.nom) {
            const exists = await Categorie.findOne({ nom: payload.nom.trim(), _id: { $ne: id } });
            if (exists) return res.fail('Nom déjà utilisé', 409);
        }

        const categorie = await Categorie.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
        if (!categorie) return res.fail('Catégorie non trouvée', 404);

        return res.success(categorie, 'Catégorie mise à jour');
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const categorie = await Categorie.findByIdAndDelete(req.params.id);
        if (!categorie) return res.fail('Catégorie non trouvée', 404);
        return res.success(null, 'Catégorie supprimée');
    } catch (error) {
        next(error);
    }
}


/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find().sort({ nom: 1 });
    res.success(categories, 'Catégories récupérées avec succès');
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.fail('Erreur lors de la récupération des catégories', 500);
  }
};

/**
 * Get a single category by ID
 */
exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    
    if (!categorie) {
      return res.fail('Catégorie non trouvée', 404);
    }
    
    res.success(categorie, 'Catégorie récupérée avec succès');
  } catch (error) {
    console.error('Error fetching categorie:', error);
    res.fail('Erreur lors de la récupération de la catégorie', 500);
  }
};

/**
 * Create a new category
 */
exports.createCategorie = async (req, res) => {
  try {
    const categorie = new Categorie(req.body);
    await categorie.save();
    
    res.success(categorie, 'Catégorie créée avec succès', 201);
  } catch (error) {
    console.error('Error creating categorie:', error);
    res.fail(error.message || 'Erreur lors de la création de la catégorie', 500);
  }
};

/**
 * Update a category
 */
exports.updateCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!categorie) {
      return res.fail('Catégorie non trouvée', 404);
    }
    
    res.success(categorie, 'Catégorie mise à jour avec succès');
  } catch (error) {
    console.error('Error updating categorie:', error);
    res.fail(error.message || 'Erreur lors de la mise à jour de la catégorie', 500);
  }
};

/**
 * Delete a category
 */
exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    
    if (!categorie) {
      return res.fail('Catégorie non trouvée', 404);
    }
    
    res.success(null, 'Catégorie supprimée avec succès');
  } catch (error) {
    console.error('Error deleting categorie:', error);
    res.fail('Erreur lors de la suppression de la catégorie', 500);
  }
};
