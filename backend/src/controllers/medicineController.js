const { validationResult } = require('express-validator');
const prisma = require('../database/prisma');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          batches: {
            select: {
              id: true,
              batchNo: true,
              stock: true,
              expiryDate: true
            }
          }
        }
      }),
      prisma.medicine.count({ where })
    ]);

    // Calculate total stock for each medicine
    const medicinesWithStock = medicines.map(medicine => ({
      ...medicine,
      totalStock: medicine.batches.reduce((sum, batch) => sum + batch.stock, 0)
    }));

    res.json({
      success: true,
      data: {
        medicines: medicinesWithStock,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching medicines'
    });
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
const getMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(id) },
      include: {
        batches: {
          orderBy: {
            expiryDate: 'asc'
          }
        }
      }
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    // Calculate total stock
    const totalStock = medicine.batches.reduce((sum, batch) => sum + batch.stock, 0);

    res.json({
      success: true,
      data: {
        medicine: {
          ...medicine,
          totalStock
        }
      }
    });

  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching medicine'
    });
  }
};

// @desc    Create medicine
// @route   POST /api/medicines
// @access  Private (ADMIN, PHARMACY)
const createMedicine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, unit, price } = req.body;

    const medicine = await prisma.medicine.create({
      data: {
        name,
        description,
        unit,
        price: parseFloat(price)
      }
    });

    res.status(201).json({
      success: true,
      data: { medicine },
      message: 'Medicine created successfully'
    });

  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating medicine'
    });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (ADMIN, PHARMACY)
const updateMedicine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, unit, price, isActive } = req.body;

    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(id) }
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    const updatedMedicine = await prisma.medicine.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        unit,
        price: parseFloat(price),
        isActive
      }
    });

    res.json({
      success: true,
      data: { medicine: updatedMedicine },
      message: 'Medicine updated successfully'
    });

  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating medicine'
    });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (ADMIN)
const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(id) },
      include: {
        batches: true
      }
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    // Delete all batches first
    await prisma.medicineBatch.deleteMany({
      where: { medicineId: parseInt(id) }
    });

    // Then delete the medicine
    await prisma.medicine.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });

  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting medicine'
    });
  }
};

// @desc    Add medicine batch
// @route   POST /api/medicines/:id/batches
// @access  Private (ADMIN, PHARMACY)
const addBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { batchNo, stock, expiryDate } = req.body;

    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(id) }
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    const batch = await prisma.medicineBatch.create({
      data: {
        medicineId: parseInt(id),
        batchNo,
        stock: parseInt(stock),
        expiryDate: new Date(expiryDate)
      }
    });

    res.status(201).json({
      success: true,
      data: { batch },
      message: 'Batch added successfully'
    });

  } catch (error) {
    console.error('Add batch error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Batch number already exists for this medicine'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while adding batch'
    });
  }
};

// @desc    Update medicine batch
// @route   PUT /api/medicines/batches/:batchId
// @access  Private (ADMIN, PHARMACY)
const updateBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { stock, expiryDate } = req.body;

    const batch = await prisma.medicineBatch.findUnique({
      where: { id: parseInt(batchId) }
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    const updatedBatch = await prisma.medicineBatch.update({
      where: { id: parseInt(batchId) },
      data: {
        stock: parseInt(stock),
        expiryDate: new Date(expiryDate)
      }
    });

    res.json({
      success: true,
      data: { batch: updatedBatch },
      message: 'Batch updated successfully'
    });

  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating batch'
    });
  }
};

// @desc    Delete medicine batch
// @route   DELETE /api/medicines/batches/:batchId
// @access  Private (ADMIN, PHARMACY)
const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await prisma.medicineBatch.findUnique({
      where: { id: parseInt(batchId) }
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    await prisma.medicineBatch.delete({
      where: { id: parseInt(batchId) }
    });

    res.json({
      success: true,
      message: 'Batch deleted successfully'
    });

  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting batch'
    });
  }
};

module.exports = {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  addBatch,
  updateBatch,
  deleteBatch
};
