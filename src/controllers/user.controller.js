const User = require('../models/User');

/**
 * Get all pending boutique users (not approved)
 */
exports.getPendingBoutiques = async (req, res, next) => {
    try {
        const pendingUsers = await User.find({
            role: 'boutique',
            isApproved: false
        }).select('-password').sort({ createdAt: -1 });

        return res.success(pendingUsers, 'Liste des boutiques en attente récupérée', 200);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all boutique users
 */
exports.getAllBoutiques = async (req, res, next) => {
    try {
        const users = await User.find({
            role: 'boutique'
        }).select('-password').sort({ createdAt: -1 });

        return res.success(users, 'Liste des boutiques récupérée', 200);
    } catch (error) {
        next(error);
    }
};

/**
 * Approve a boutique user
 */
exports.approveBoutique = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const user = await User.findById(id);
        if (!user) {
            return res.fail('Utilisateur non trouvé', 404);
        }

        if (user.role !== 'boutique') {
            return res.fail('Seules les boutiques peuvent être approuvées', 400);
        }

        if (user.isApproved) {
            return res.fail('Cette boutique est déjà approuvée', 400);
        }

        user.isApproved = true;
        user.approvedAt = new Date();
        user.approvedBy = adminId;
        await user.save();

        return res.success(
            {
                id: user._id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                isApproved: user.isApproved,
                approvedAt: user.approvedAt
            },
            'Boutique approuvée avec succès',
            200
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Reject/Delete a pending boutique user
 */
exports.rejectBoutique = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.fail('Utilisateur non trouvé', 404);
        }

        if (user.role !== 'boutique') {
            return res.fail('Seules les boutiques peuvent être rejetées', 400);
        }

        if (user.isApproved) {
            return res.fail('Impossible de rejeter une boutique déjà approuvée', 400);
        }

        await User.findByIdAndDelete(id);

        return res.success(null, 'Demande de boutique rejetée', 200);
    } catch (error) {
        next(error);
    }
};
