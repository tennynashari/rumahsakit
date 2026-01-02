const { validationResult } = require('express-validator');
const prisma = require('../database/prisma');

// Generate unique Medical Record Number
const generateMRN = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const prefix = `MRN${year}${month}${day}`;
  
  // Find the last MRN for today
  const lastPatient = await prisma.patient.findFirst({
    where: {
      medicalRecordNo: {
        startsWith: prefix
      }
    },
    orderBy: {
      medicalRecordNo: 'desc'
    }
  });

  let sequence = 1;
  if (lastPatient) {
    const lastSequence = parseInt(lastPatient.medicalRecordNo.slice(-3));
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          medicalRecordNo: true,
          name: true,
          dateOfBirth: true,
          gender: true,
          phone: true,
          address: true,
          createdAt: true,
          _count: {
            select: {
              visits: true
            }
          }
        }
      }),
      prisma.patient.count()
    ]);

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching patients'
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      include: {
        visits: {
          take: 5,
          orderBy: {
            scheduledAt: 'desc'
          },
          include: {
            doctor: {
              select: {
                name: true,
                department: true
              }
            }
          }
        },
        _count: {
          select: {
            visits: true,
            medicalRecords: true,
            billings: true
          }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: { patient }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching patient'
    });
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (Admin, Front Desk)
const createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      name, 
      dateOfBirth, 
      gender, 
      phone, 
      address, 
      emergencyContact,
      emergencyPhone,
      email,
      bloodType,
      allergies
    } = req.body;

    // Generate unique MRN
    const medicalRecordNo = await generateMRN();

    // Build emergency contact object
    const emergencyContactData = {};
    if (emergencyContact || emergencyPhone) {
      emergencyContactData.name = emergencyContact || '';
      emergencyContactData.phone = emergencyPhone || '';
      emergencyContactData.email = email || '';
      emergencyContactData.bloodType = bloodType || '';
      emergencyContactData.allergies = allergies || '';
    }

    const patient = await prisma.patient.create({
      data: {
        medicalRecordNo,
        name,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        address,
        emergencyContact: Object.keys(emergencyContactData).length > 0 ? emergencyContactData : null
      }
    });

    res.status(201).json({
      success: true,
      data: { patient },
      message: 'Patient created successfully'
    });

  } catch (error) {
    console.error('Create patient error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Medical record number already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while creating patient'
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Admin, Front Desk)
const updatePatient = async (req, res) => {
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
    const { 
      name, 
      dateOfBirth, 
      gender, 
      phone, 
      address,
      emergencyContact,
      emergencyPhone,
      email,
      bloodType,
      allergies
    } = req.body;

    // Build emergency contact object
    const emergencyContactData = {};
    if (emergencyContact || emergencyPhone || email || bloodType || allergies) {
      emergencyContactData.name = emergencyContact || '';
      emergencyContactData.phone = emergencyPhone || '';
      emergencyContactData.email = email || '';
      emergencyContactData.bloodType = bloodType || '';
      emergencyContactData.allergies = allergies || '';
    }

    const updateData = {
      name,
      gender,
      phone,
      address
    };

    // Only update dateOfBirth if provided
    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    // Only update emergencyContact if data exists
    if (Object.keys(emergencyContactData).length > 0) {
      updateData.emergencyContact = emergencyContactData;
    }

    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      data: { patient },
      message: 'Patient updated successfully'
    });

  } catch (error) {
    console.error('Update patient error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while updating patient'
    });
  }
};

// @desc    Delete patient (soft delete)
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if patient has any visits or records
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            visits: true,
            medicalRecords: true,
            billings: true
          }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    if (patient._count.visits > 0 || patient._count.medicalRecords > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete patient with existing visits or medical records'
      });
    }

    await prisma.patient.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while deleting patient'
    });
  }
};

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private
const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            medicalRecordNo: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            phone: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      take: 20,
      select: {
        id: true,
        medicalRecordNo: true,
        name: true,
        dateOfBirth: true,
        gender: true,
        phone: true
      }
    });

    res.json({
      success: true,
      data: { patients }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while searching patients'
    });
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients
};