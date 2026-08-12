const express = require('express');
const { getStudents, getStudentUnallocated, updateStudent, checkAndDeallocateExpiredStays } = require('../controllers/studentController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateAdmin, getStudents);
router.get('/unallocated', authenticateAdmin, getStudentUnallocated);
router.put('/:id', authenticateAdmin, updateStudent);
router.post('/check-expiry', authenticateAdmin, checkAndDeallocateExpiredStays);

module.exports = router;
