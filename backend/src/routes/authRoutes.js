const express = require('express');
const { login, me, changePassword, getUsers, createUser, updateUser, deleteUser } = require('../controllers/authController');
const { authenticateAdmin, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateAdmin, me);
router.post('/change-password', authenticateAdmin, changePassword);

// User Management (Super Admin)
router.get('/users', authenticateAdmin, authorizeRoles('SUPER_ADMIN'), getUsers);
router.post('/users', authenticateAdmin, authorizeRoles('SUPER_ADMIN'), createUser);
router.put('/users/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN'), updateUser);
router.delete('/users/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN'), deleteUser);

module.exports = router;
