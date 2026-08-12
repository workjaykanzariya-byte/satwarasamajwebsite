const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { authenticateAdmin, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateAdmin, authorizeRoles('SUPER_ADMIN'), getAuditLogs);

module.exports = router;
