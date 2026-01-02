const { validationResult } = require('express-validator');
const prisma = require('../database/prisma');

// @desc    Get all medical records
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const patientId = req.query.patientId;

    const where = patientId ? { patientId: parseInt(patientId) } : {};

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          patient: {
            select: {
              id: true,
              medicalRecordNo: true,
              name: true,
              dateOfBirth: true,
              gender: true
            }
          },
          doctor: {
            select: {
              id: true,
              name: true,
              department: true
            }
          },
          visit: {
            select: {
              id: true,
              visitType: true,
              scheduledAt: true,
              status: true
            }
          }
        }
      }),
      prisma.medicalRecord.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching medical records'
    });
  }
};

// @desc    Get single medical record
// @route   GET /api/records/:id
// @access  Private
const getRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          select: {
            id: true,
            medicalRecordNo: true,
            name: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            address: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            department: true,
            phone: true
          }
        },
        visit: {
          select: {
            id: true,
            visitType: true,
            scheduledAt: true,
            status: true
          }
        }
      }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      data: { record }
    });

  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching medical record'
    });
  }
};

// @desc    Create new medical record
// @route   POST /api/records
// @access  Private
const createRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { visitId, patientId, doctorId, diagnosisCode, symptoms, diagnosis, treatment, prescription, attachments } = req.body;

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Check if doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: parseInt(doctorId) }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Prepare data object
    const recordData = {
      patientId: parseInt(patientId),
      doctorId: parseInt(doctorId),
      diagnosisCode: diagnosisCode || null,
      symptoms: symptoms || null,
      diagnosis: diagnosis || null,
      treatment: treatment || null,
      prescription: prescription || null,
      attachments: attachments || null
    };

    // Only add visitId if provided
    if (visitId) {
      recordData.visitId = parseInt(visitId);
    }

    const record = await prisma.medicalRecord.create({
      data: recordData,
      include: {
        patient: {
          select: {
            id: true,
            medicalRecordNo: true,
            name: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { record },
      message: 'Medical record created successfully'
    });

  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating medical record'
    });
  }
};

// @desc    Update medical record
// @route   PUT /api/records/:id
// @access  Private
const updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { diagnosisCode, symptoms, diagnosis, treatment, prescription, attachments } = req.body;

    // Check if record exists
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    const record = await prisma.medicalRecord.update({
      where: { id: parseInt(id) },
      data: {
        diagnosisCode,
        symptoms,
        diagnosis,
        treatment,
        prescription,
        attachments
      },
      include: {
        patient: {
          select: {
            id: true,
            medicalRecordNo: true,
            name: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: { record },
      message: 'Medical record updated successfully'
    });

  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating medical record'
    });
  }
};

// @desc    Delete medical record
// @route   DELETE /api/records/:id
// @access  Private
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    await prisma.medicalRecord.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });

  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting medical record'
    });
  }
};

module.exports = {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord
};
