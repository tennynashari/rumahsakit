const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  addBatch,
  updateBatch,
  deleteBatch,
  exportMedicinesExcel
} = require('../controllers/medicineController');

const router = express.Router();

// @route   GET /api/medicines/export/excel
// @desc    Export all medicines to Excel
// @access  Private
router.get('/export/excel', auth, exportMedicinesExcel);

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Private
router.get('/', auth, getMedicines);

// @route   GET /api/medicines/:id
// @desc    Get medicine by ID
// @access  Private
router.get('/:id', auth, getMedicine);

// @route   POST /api/medicines
// @desc    Create new medicine
// @access  Private (Admin, Pharmacy)
router.post('/', [
  auth,
  authorize('ADMIN', 'PHARMACY'),
  body('name').trim().isLength({ min: 2 }),
  body('unit').trim().notEmpty(),
  body('price').isFloat({ min: 0 })
], createMedicine);

// @route   PUT /api/medicines/:id
// @desc    Update medicine
// @access  Private (Admin, Pharmacy)
router.put('/:id', [
  auth,
  authorize('ADMIN', 'PHARMACY')
], updateMedicine);

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine
// @access  Private (Admin)
router.delete('/:id', auth, authorize('ADMIN'), deleteMedicine);

// @route   POST /api/medicines/:id/batch
// @desc    Add new batch to medicine
// @access  Private (Admin, Pharmacy)
router.post('/:id/batch', [
  auth,
  authorize('ADMIN', 'PHARMACY'),
  body('batchNo').trim().notEmpty(),
  body('stock').isInt({ min: 0 }),
  body('expiryDate').isISO8601()
], addBatch);

// @route   PUT /api/medicines/:id/batch/:batchId
// @desc    Update medicine batch
// @access  Private (Admin, Pharmacy)
router.put('/:id/batch/:batchId', [
  auth,
  authorize('ADMIN', 'PHARMACY')
], updateBatch);

// @route   DELETE /api/medicines/:id/batch/:batchId
// @desc    Delete medicine batch
// @access  Private (Admin)
router.delete('/:id/batch/:batchId', auth, authorize('ADMIN'), deleteBatch);

module.exports = router;