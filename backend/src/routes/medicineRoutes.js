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
  deleteBatch
} = require('../controllers/medicineController');

const router = express.Router();

// Medicine routes
router.get('/', auth, getMedicines);
router.get('/:id', auth, getMedicine);

router.post(
  '/',
  auth,
  authorize('ADMIN', 'PHARMACY'),
  [
    body('name').trim().notEmpty().withMessage('Medicine name is required'),
    body('unit').trim().notEmpty().withMessage('Unit is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
  ],
  createMedicine
);

router.put(
  '/:id',
  auth,
  authorize('ADMIN', 'PHARMACY'),
  [
    body('name').trim().notEmpty().withMessage('Medicine name is required'),
    body('unit').trim().notEmpty().withMessage('Unit is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
  ],
  updateMedicine
);

router.delete('/:id', auth, authorize('ADMIN'), deleteMedicine);

// Batch routes
router.post(
  '/:id/batches',
  auth,
  authorize('ADMIN', 'PHARMACY'),
  [
    body('batchNo').trim().notEmpty().withMessage('Batch number is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive number'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required')
  ],
  addBatch
);

router.put(
  '/batches/:batchId',
  auth,
  authorize('ADMIN', 'PHARMACY'),
  [
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive number'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required')
  ],
  updateBatch
);

router.delete('/batches/:batchId', auth, authorize('ADMIN', 'PHARMACY'), deleteBatch);

module.exports = router;