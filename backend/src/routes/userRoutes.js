const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', auth, getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, getUser);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', [
  auth,
  authorize('ADMIN'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']).withMessage('Invalid role')
], createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only or own profile)
router.put('/:id', [
  auth,
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().isIn(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']).withMessage('Invalid role')
], updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('ADMIN'), deleteUser);

module.exports = router;