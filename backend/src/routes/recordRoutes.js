const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/recordController');

const router = express.Router();

// @route   GET /api/records
// @desc    Get all medical records
// @access  Private
router.get('/', auth, getRecords);

// @route   GET /api/records/:id
// @desc    Get medical record by ID
// @access  Private
router.get('/:id', auth, getRecord);

// @route   POST /api/records
// @desc    Create new medical record
// @access  Private (Doctor, Nurse)
router.post('/', [
  auth,
  authorize('ADMIN', 'DOCTOR', 'NURSE'),
  body('patientId').isInt(),
  body('doctorId').isInt(),
  body('symptoms').notEmpty().withMessage('Symptoms are required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required')
], createRecord);

// @route   PUT /api/records/:id
// @desc    Update medical record
// @access  Private (Doctor, Nurse)
router.put('/:id', [
  auth,
  authorize('ADMIN', 'DOCTOR', 'NURSE'),
  body('symptoms').optional().notEmpty(),
  body('diagnosis').optional().notEmpty()
], updateRecord);

// @route   DELETE /api/records/:id
// @desc    Delete medical record
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('ADMIN'), deleteRecord);

module.exports = router;