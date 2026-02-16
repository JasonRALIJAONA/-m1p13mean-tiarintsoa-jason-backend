const Categorie = require('../models/Categorie');

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
