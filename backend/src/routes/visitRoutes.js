const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  getVisits,
  getVisit,
  createVisit,
  updateVisit,
  deleteVisit,
  exportVisitsExcel
} = require('../controllers/visitController');

const router = express.Router();

// @route   GET /api/visits/export/excel
// @desc    Export all visits to Excel
// @access  Private
router.get('/export/excel', auth, exportVisitsExcel);

// @route   GET /api/visits
// @desc    Get all visits
// @access  Private
router.get('/', auth, getVisits);

// @route   GET /api/visits/:id
// @desc    Get visit by ID
// @access  Private
router.get('/:id', auth, getVisit);

// @route   POST /api/visits
// @desc    Create new visit
// @access  Private (Admin, Front Desk, Doctor)
router.post('/', [
  auth,
  authorize('ADMIN', 'FRONT_DESK', 'DOCTOR'),
  body('patientId').isInt(),
  body('doctorId').isInt(),
  body('visitType').isIn(['GENERAL_CHECKUP', 'OUTPATIENT', 'INPATIENT', 'EMERGENCY']),
  body('scheduledAt').isISO8601()
], createVisit);

// @route   PUT /api/visits/:id
// @desc    Update visit
// @access  Private (Admin, Front Desk, Doctor)
router.put('/:id', [
  auth,
  authorize('ADMIN', 'FRONT_DESK', 'DOCTOR'),
], updateVisit);

// @route   DELETE /api/visits/:id
// @desc    Delete visit
// @access  Private (Admin)
router.delete('/:id', auth, authorize('ADMIN'), deleteVisit);

module.exports = router;