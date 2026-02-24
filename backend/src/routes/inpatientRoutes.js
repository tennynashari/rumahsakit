const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  getInpatients,
  getInpatient,
  checkInPatient,
  updateOccupancy,
  checkOutPatient,
  getOccupancyHistory
} = require('../controllers/inpatientController');

const router = express.Router();

// @route   GET /api/inpatients/history
// @desc    Get occupancy history
// @access  Private
router.get('/history', auth, getOccupancyHistory);

// @route   POST /api/inpatients/check-in
// @desc    Check-in patient to room
// @access  Private (Admin, Nurse, Front Desk)
router.post('/check-in', [
  auth,
  authorize('ADMIN', 'NURSE', 'FRONT_DESK'),
  body('patientId').isInt().withMessage('Patient ID is required'),
  body('roomId').isInt().withMessage('Room ID is required'),
  body('doctorId').isInt().withMessage('Doctor ID is required'),
  body('initialDiagnosis').notEmpty().withMessage('Initial diagnosis is required'),
  body('bedNumber').optional().isInt({ min: 1 }),
  body('checkedInAt').optional().isISO8601(),
  body('estimatedCheckoutAt').optional().isISO8601(),
  body('careClass').optional().isString(),
  body('notes').optional().isString()
], checkInPatient);

// @route   POST /api/inpatients/:id/check-out
// @desc    Check-out patient from room
// @access  Private (Admin, Nurse, Doctor)
router.post('/:id/check-out', [
  auth,
  authorize('ADMIN', 'NURSE', 'DOCTOR'),
  body('checkedOutAt').optional().isISO8601(),
  body('dischargeCondition').isIn(['SEMBUH', 'MEMBAIK', 'RUJUK', 'MENINGGAL', 'APS']),
  body('finalDiagnosis').optional().isString(),
  body('dischargeNotes').optional().isString()
], checkOutPatient);

// @route   GET /api/inpatients
// @desc    Get all active inpatients
// @access  Private
router.get('/', auth, getInpatients);

// @route   GET /api/inpatients/:id
// @desc    Get single inpatient detail
// @access  Private
router.get('/:id', auth, getInpatient);

// @route   PUT /api/inpatients/:id
// @desc    Update occupancy (change room, etc)
// @access  Private (Admin, Nurse)
router.put('/:id', [
  auth,
  authorize('ADMIN', 'NURSE'),
  body('roomId').optional().isInt(),
  body('bedNumber').optional().isInt({ min: 1 }),
  body('doctorId').optional().isInt(),
  body('estimatedCheckoutAt').optional().isISO8601()
], updateOccupancy);

module.exports = router;
