const express = require('express');
const {
  submitQRPayment,
  trackDonationStatus,
  verifyDonationByAdmin,
  createDonationOrder,
  getCertificateDetails,
  getAdminDonations,
  getAdminDonationById,
  deleteDonation,
  bulkDeleteDonations,
  getPublicStats,
  importCSVDonations,
} = require('../controllers/mahadanController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public Routes
router.get('/public-stats', getPublicStats);
router.post('/submit-qr-payment', submitQRPayment);
router.get('/track/:query', trackDonationStatus);
router.post('/create-order', upload.single('photo'), createDonationOrder);
router.get('/certificate/:certificateNo', getCertificateDetails);

// Admin Routes (Protected)
router.get('/admin/all', authenticateAdmin, getAdminDonations);
router.post('/admin/import-csv', authenticateAdmin, upload.single('csvFile'), importCSVDonations);
router.get('/admin/:id', authenticateAdmin, getAdminDonationById);
router.put('/admin/:id/verify', authenticateAdmin, verifyDonationByAdmin);
router.delete('/admin/bulk', authenticateAdmin, bulkDeleteDonations);
router.delete('/admin/:id', authenticateAdmin, deleteDonation);

module.exports = router;

