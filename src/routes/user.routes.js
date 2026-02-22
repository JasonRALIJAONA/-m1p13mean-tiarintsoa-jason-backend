const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

// Admin-only routes
router.get('/pending-boutiques', auth, authorize(['admin']), userController.getPendingBoutiques);
router.get('/boutiques', auth, authorize(['admin']), userController.getAllBoutiques);
router.patch('/:id/approve', auth, authorize(['admin']), userController.approveBoutique);
router.delete('/:id/reject', auth, authorize(['admin']), userController.rejectBoutique);

module.exports = router;
