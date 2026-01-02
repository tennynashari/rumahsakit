const express = require('express');
const { body } = require('express-validator');
const billingController = require('../controllers/billingController');
const { auth, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all billings with filters
router.get('/', auth, billingController.getBillings);

// Get billing statistics
router.get('/stats', auth, billingController.getBillingStats);

// Get single billing
router.get('/:id', auth, billingController.getBilling);

// Create new billing
router.post('/',
  auth,
  authorize('ADMIN', 'FRONT_DESK'),
  [
    body('patientId').notEmpty().withMessage('Patient is required').isInt(),
    body('items').notEmpty().withMessage('Items are required').isArray(),
    body('subtotal').notEmpty().withMessage('Subtotal is required').isFloat({ min: 0 }),
    body('total').notEmpty().withMessage('Total is required').isFloat({ min: 0 })
  ],
  billingController.createBilling
);

// Update billing
router.put('/:id',
  auth,
  authorize('ADMIN', 'FRONT_DESK'),
  [
    body('items').optional().isArray(),
    body('subtotal').optional().isFloat({ min: 0 }),
    body('total').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'])
  ],
  billingController.updateBilling
);

// Record payment
router.post('/:id/payment',
  auth,
  authorize('ADMIN', 'FRONT_DESK'),
  [
    body('amountPaid').notEmpty().withMessage('Amount paid is required').isFloat({ min: 0 })
  ],
  billingController.recordPayment
);

// Delete billing
router.delete('/:id',
  auth,
  authorize('ADMIN'),
  billingController.deleteBilling
);

module.exports = router;