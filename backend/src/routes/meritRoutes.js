const express = require('express');
const {
  generateMeritList,
  createCustomMeritList,
  publishMeritList,
  deleteMeritList,
  getPublicMeritLists,
  getAdminMeritLists,
} = require('../controllers/meritController');
const { authenticateAdmin, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public Published Merit Lists
router.get('/public', getPublicMeritLists);

// Admin Merit Management Routes
router.get('/admin', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER'), getAdminMeritLists);
router.post('/generate', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER'), generateMeritList);
router.post('/custom', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER'), upload.single('pdfFile'), createCustomMeritList);
router.put('/:id/publish', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER'), publishMeritList);
router.delete('/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER'), deleteMeritList);

module.exports = router;
