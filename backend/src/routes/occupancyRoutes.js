const express = require('express');
const {
  getHostelsSummary,
  getHostelHierarchy,
  getVisualOccupancyGrid,
  createHostel,
  updateHostelDetails,
  addFloor,
  addRoom,
  addBed,
  updateBedStatus,
  assignStudentToBed,
  vacateBed,
  searchStudentBedLocation,
  getVacantBeds,
  deleteFloor,
  deleteRoom,
} = require('../controllers/occupancyController');
const { authenticateAdmin, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public summary endpoint
router.get('/summary', getHostelsSummary);

// Admin Occupancy Routes
router.get('/hostel/:hostelId/hierarchy', authenticateAdmin, getHostelHierarchy);
router.get('/hostel/:hostelId/visual-grid', authenticateAdmin, getVisualOccupancyGrid);
router.get('/search-location', authenticateAdmin, searchStudentBedLocation);
router.get('/vacant-beds', authenticateAdmin, getVacantBeds);

// Dynamic Structure Management Actions
router.post('/hostels', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), createHostel);
router.put('/hostels/:id', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), updateHostelDetails);
router.post('/floors', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), addFloor);
router.delete('/floors/:floorId', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), deleteFloor);
router.post('/rooms', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), addRoom);
router.delete('/rooms/:roomId', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), deleteRoom);
router.post('/beds', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), addBed);
router.put('/beds/:bedId/status', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), updateBedStatus);

// Allotments
router.post('/assign-student', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), assignStudentToBed);
router.post('/vacate-bed', authenticateAdmin, authorizeRoles('SUPER_ADMIN', 'HOSTEL_MANAGER'), vacateBed);

module.exports = router;
