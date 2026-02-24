const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getDashboardStats,
  exportRoomsExcel
} = require('../controllers/roomController');

const router = express.Router();

// @route   GET /api/rooms/export
// @desc    Export rooms to Excel
// @access  Private
router.get('/export', auth, exportRoomsExcel);

// @route   GET /api/rooms/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard/stats', auth, getDashboardStats);

// @route   GET /api/rooms
// @desc    Get all rooms with pagination and filters
// @access  Private
router.get('/', auth, getRooms);

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Private
router.get('/:id', auth, getRoom);

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private (Admin only)
router.post('/', [
  auth,
  authorize('ADMIN'),
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('roomType').isIn(['VIP', 'KELAS_1', 'KELAS_2', 'KELAS_3', 'ICU', 'NICU', 'PICU', 'ISOLATION']),
  body('floor').isInt({ min: 1 }).withMessage('Floor must be a positive integer'),
  body('bedCapacity').isInt({ min: 1 }).withMessage('Bed capacity must be at least 1'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], createRoom);

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  authorize('ADMIN')
], updateRoom);

// @route   DELETE /api/rooms/:id
// @desc    Delete room (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [
  auth,
  authorize('ADMIN')
], deleteRoom);

module.exports = router;
