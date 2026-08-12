const express = require('express');
const {
  sendMobileOtp,
  verifyMobileOtp,
  submitApplication,
  trackApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  verifyDocument,
} = require('../controllers/applicationController');
const { serveDocument } = require('../controllers/documentController');
const { authenticateAdmin, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public Routes
router.post('/otp/send', sendMobileOtp);
router.post('/otp/verify', verifyMobileOtp);
router.post('/submit', upload.any(), submitApplication);
router.post('/track', trackApplication);

// Admin Routes
router.get('/', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER', 'HOSTEL_MANAGER', 'VIEWER'), getApplications);
router.get('/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER', 'HOSTEL_MANAGER', 'VIEWER'), getApplicationById);
router.put('/:id/status', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER'), updateApplicationStatus);

// Secured Document Stream Route
router.get('/documents/:docId/file', authenticateAdmin, serveDocument);
router.put('/documents/:docId/verify', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ADMISSION_MANAGER'), verifyDocument);

module.exports = router;
