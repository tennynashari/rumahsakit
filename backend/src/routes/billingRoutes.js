const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  getBillings,
  getBilling,
  createBilling,
  updateBilling,
  recordPayment,
  deleteBilling,
  getBillingStats,
  exportBillingsExcel
} = require('../controllers/billingController');

const router = express.Router();

// @route   GET /api/billing/export/excel
// @desc    Export all billings to Excel
// @access  Private
router.get('/export/excel', auth, exportBillingsExcel);

// @route   GET /api/billing/stats
// @desc    Get billing statistics
// @access  Private
router.get('/stats', auth, getBillingStats);

// @route   GET /api/billing
// @desc    Get all billings
// @access  Private
router.get('/', auth, getBillings);

// @route   GET /api/billing/:id
// @desc    Get billing by ID
// @access  Private
router.get('/:id', auth, getBilling);

// @route   POST /api/billing
// @desc    Create new billing
// @access  Private (Admin, Front Desk, Doctor)
router.post('/', [
  auth,
  authorize('ADMIN', 'FRONT_DESK', 'DOCTOR'),
  body('patientId').isInt(),
  body('visitId').optional().isInt()
], createBilling);

// @route   PUT /api/billing/:id
// @desc    Update billing
// @access  Private (Admin, Front Desk)
router.put('/:id', [
  auth,
  authorize('ADMIN', 'FRONT_DESK')
], updateBilling);

// @route   POST /api/billing/:id/payment
// @desc    Record payment for billing
// @access  Private (Admin, Front Desk)
router.post('/:id/payment', [
  auth,
  authorize('ADMIN', 'FRONT_DESK')
], recordPayment);

// @route   DELETE /api/billing/:id
// @desc    Delete billing
// @access  Private (Admin)
router.delete('/:id', auth, authorize('ADMIN'), deleteBilling);

module.exports = router;