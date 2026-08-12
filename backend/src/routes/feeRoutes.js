const express = require('express');
const { recordFeePayment, getFeePayments, getFeeStructures } = require('../controllers/feeController');
const { authenticateAdmin, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/payments', authenticateAdmin, getFeePayments);
router.post('/payments', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'ACCOUNTS_MANAGER'), recordFeePayment);
router.get('/structures', getFeeStructures);

module.exports = router;
