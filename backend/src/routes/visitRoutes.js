const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const { 
  getVisits, 
  getVisit, 
  createVisit, 
  updateVisit, 
  deleteVisit 
} = require('../controllers/visitController');

const router = express.Router();

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
// @access  Private (Admin, Doctor, Nurse, Front Desk)
router.post('/', [
  auth,
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'FRONT_DESK'),
  body('patientId').isInt(),
  body('doctorId').isInt(),
  body('visitType').isIn(['OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'GENERAL_CHECKUP']),
  body('scheduledAt').isISO8601(),
  body('notes').optional({ checkFalsy: true }).trim()
], createVisit);

// @route   PUT /api/visits/:id
// @desc    Update visit
// @access  Private (Admin, Doctor, Nurse, Front Desk)
router.put('/:id', [
  auth,
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'FRONT_DESK'),
  body('visitType').optional().isIn(['OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'GENERAL_CHECKUP']),
  body('scheduledAt').optional().isISO8601(),
  body('status').optional().isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  body('notes').optional({ checkFalsy: true }).trim(),
  body('diagnosis').optional({ checkFalsy: true }).trim(),
  body('treatment').optional({ checkFalsy: true }).trim()
], updateVisit);

// @route   DELETE /api/visits/:id
// @desc    Delete visit
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('ADMIN'), deleteVisit);

module.exports = router;