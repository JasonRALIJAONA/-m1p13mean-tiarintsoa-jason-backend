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
};
