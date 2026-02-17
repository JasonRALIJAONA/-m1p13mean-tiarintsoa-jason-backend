const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const createToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const formatAuthResponse = (user, token) => ({
    token,
    user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom
    }
});

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.fail('Validation échouée', 400, errors.array());
        }

        const { email, password, role, nom, prenom } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.fail('Email déjà utilisé', 409);
        }

        const user = await User.create({
            email,
            password,
            role,
            nom,
            prenom
        });

        const token = createToken(user);
        return res.success(formatAuthResponse(user, token), 'Inscription réussie', 201);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.fail('Validation échouée', 400, errors.array());
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.fail('Identifiants invalides', 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.fail('Identifiants invalides', 401);
        }

        const token = createToken(user);
        return res.success(formatAuthResponse(user, token), 'Connexion réussie', 200);
    } catch (error) {
        next(error);
    }
};
