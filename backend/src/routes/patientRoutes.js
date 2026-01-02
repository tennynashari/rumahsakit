const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const { 
  getPatients, 
  getPatient, 
  createPatient, 
  updatePatient, 
  deletePatient,
  searchPatients
} = require('../controllers/patientController');

const router = express.Router();

// @route   GET /api/patients
// @desc    Get all patients with pagination
// @access  Private
router.get('/', auth, getPatients);

// @route   GET /api/patients/search
// @desc    Search patients
// @access  Private
router.get('/search', auth, searchPatients);

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', auth, getPatient);

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private (Admin, Front Desk)
router.post('/', [
  auth,
  authorize('ADMIN', 'FRONT_DESK'),
  body('name').trim().isLength({ min: 2 }),
  body('dateOfBirth').isISO8601(),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('address').optional({ checkFalsy: true }).trim(),
  body('email').optional({ checkFalsy: true }).trim(),
  body('emergencyContact').optional({ checkFalsy: true }).trim(),
  body('emergencyPhone').optional({ checkFalsy: true }).trim(),
  body('bloodType').optional({ checkFalsy: true }).trim(),
  body('allergies').optional({ checkFalsy: true }).trim()
], createPatient);

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private (Admin, Front Desk)
router.put('/:id', [
  auth,
  authorize('ADMIN', 'FRONT_DESK'),
  body('name').optional().trim().isLength({ min: 2 }),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('address').optional({ checkFalsy: true }).trim(),
  body('email').optional({ checkFalsy: true }).trim(),
  body('emergencyContact').optional({ checkFalsy: true }).trim(),
  body('emergencyPhone').optional({ checkFalsy: true }).trim(),
  body('bloodType').optional({ checkFalsy: true }).trim(),
  body('allergies').optional({ checkFalsy: true }).trim()
], updatePatient);

// @route   DELETE /api/patients/:id
// @desc    Delete patient (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('ADMIN'), deletePatient);

module.exports = router;