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
        prenom: user.prenom,
        isApproved: user.isApproved
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

        // const token = createToken(user);
        const token = null; // No token issued at registration, admin approval required
        return res.success(formatAuthResponse(user, token), 'Inscription réussie', 201);
    } catch (error) {
        next(error);
    }
};

exports.loginAdmin = async (req, res, next) => {
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

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.fail('Accès refusé. Seuls les administrateurs peuvent accéder au back-office.', 403);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.fail('Identifiants invalides', 401);
        }

        const token = createToken(user);
        return res.success(formatAuthResponse(user, token), 'Connexion administrateur réussie', 200);
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

        // Check if user is boutique
        if (user.role !== 'boutique') {
            return res.fail('Accès refusé. Seuls les comptes boutique peuvent se connecter ici.', 403);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.fail('Identifiants invalides', 401);
        }

        // Check if boutique user is approved
        if (!user.isApproved) {
            return res.fail('Votre compte est en attente d\'approbation par un administrateur', 403);
        }

        const token = createToken(user);
        return res.success(formatAuthResponse(user, token), 'Connexion boutique réussie', 200);
    } catch (error) {
        next(error);
    }
};
