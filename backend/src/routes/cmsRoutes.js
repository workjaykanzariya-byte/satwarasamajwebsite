const express = require('express');
const {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getPublications,
  createPublication,
  updatePublication,
  deletePublication,
  getGallery,
  getDownloads,
  getCommittee,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  getPageBySlug,
  getSettings,
  updateSettings,
  uploadQRCode,
  createEnquiry,
  getEnquiries,
} = require('../controllers/cmsController');
const { authenticateAdmin, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public CMS Routes
router.get('/news', getNews);
router.get('/publications', getPublications);
router.get('/gallery', getGallery);
router.get('/downloads', getDownloads);
router.get('/committee', getCommittee);
router.get('/pages/:slug', getPageBySlug);
router.get('/settings', getSettings);
router.post('/enquiries', createEnquiry);

// Admin CMS Routes
router.post('/news', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'CONTENT_MANAGER'), createNews);
router.put('/news/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'CONTENT_MANAGER'), updateNews);
router.delete('/news/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'CONTENT_MANAGER'), deleteNews);
router.post('/publications', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'CONTENT_MANAGER'), createPublication);
router.put('/publications/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'CONTENT_MANAGER'), updatePublication);
router.delete('/publications/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'CONTENT_MANAGER'), deletePublication);

router.post('/committee', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'COMMITTEE_MANAGER'), createCommitteeMember);
router.put('/committee/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'COMMITTEE_MANAGER'), updateCommitteeMember);
router.delete('/committee/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'COMMITTEE_MANAGER'), deleteCommitteeMember);

router.post('/settings', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'CONTENT_MANAGER'), updateSettings);
router.post('/settings/upload-qr', authenticateAdmin, upload.single('qrImage'), uploadQRCode);

router.get('/enquiries', authenticateAdmin, getEnquiries);

module.exports = router;
