const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  exportRecordsExcel
} = require('../controllers/recordController');

const router = express.Router();

// @route   GET /api/records/export/excel
// @desc    Export all medical records to Excel
// @access  Private
router.get('/export/excel', auth, exportRecordsExcel);

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
// @access  Private (Admin, Doctor)
router.post('/', [
  auth,
  authorize('ADMIN', 'DOCTOR'),
  body('visitId').isInt(),
  body('patientId').isInt(),
  body('doctorId').isInt()
], createRecord);

// @route   PUT /api/records/:id
// @desc    Update medical record
// @access  Private (Admin, Doctor)
router.put('/:id', [
  auth,
  authorize('ADMIN', 'DOCTOR')
], updateRecord);

// @route   DELETE /api/records/:id
// @desc    Delete medical record
// @access  Private (Admin)
router.delete('/:id', auth, authorize('ADMIN'), deleteRecord);

module.exports = router;