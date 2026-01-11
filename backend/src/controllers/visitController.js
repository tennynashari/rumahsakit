const { validationResult } = require('express-validator');
const prisma = require('../database/prisma');

// @desc    Get all visits
// @route   GET /api/visits
// @access  Private
const getVisits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { patientId } = req.query;

    // Build where clause
    const where = {};
    if (patientId) {
      where.patientId = parseInt(patientId);
    }

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          scheduledAt: 'desc'
        },
        select: {
          id: true,
          patientId: true,
          doctorId: true,
          visitType: true,
          scheduledAt: true,
          queueNumber: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          patient: {
            select: {
              id: true,
              medicalRecordNo: true,
              name: true,
              phone: true
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
      }),
      prisma.visit.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        visits,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching visits'
    });
  }
};

// @desc    Get single visit
// @route   GET /api/visits/:id
// @access  Private
const getVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const visit = await prisma.visit.findUnique({
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
        medicalRecords: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!visit) {
      return res.status(404).json({
        success: false,
        error: 'Visit not found'
      });
    }

    res.json({
      success: true,
      data: { visit }
    });

  } catch (error) {
    console.error('Get visit error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching visit'
    });
  }
};

// @desc    Create new visit
// @route   POST /api/visits
// @access  Private
const createVisit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { patientId, doctorId, visitType, scheduledAt, notes } = req.body;

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

    // Generate queue number (format: YYMMDD-XXX)
    const scheduleDate = new Date(scheduledAt);
    const year = scheduleDate.getFullYear().toString().slice(-2);
    const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
    const day = String(scheduleDate.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    // Get the highest queue number for the same date
    const lastVisit = await prisma.visit.findFirst({
      where: {
        queueNumber: {
          startsWith: datePrefix
        }
      },
      orderBy: {
        queueNumber: 'desc'
      },
      select: {
        queueNumber: true
      }
    });

    let nextNumber = 1;
    if (lastVisit && lastVisit.queueNumber) {
      // Extract the sequence number from the last queue number
      const lastSequence = parseInt(lastVisit.queueNumber.split('-')[1]);
      nextNumber = lastSequence + 1;
    }

    const queueNumber = `${datePrefix}-${String(nextNumber).padStart(3, '0')}`;

    const visit = await prisma.visit.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        visitType,
        scheduledAt: new Date(scheduledAt),
        queueNumber,
        status: 'SCHEDULED',
        notes
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

    res.status(201).json({
      success: true,
      data: { visit },
      message: 'Visit created successfully'
    });

  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating visit'
    });
  }
};

// @desc    Update visit
// @route   PUT /api/visits/:id
// @access  Private
const updateVisit = async (req, res) => {
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
    const { visitType, scheduledAt, status, notes } = req.body;

    // Get existing visit to check if date changes
    const existingVisit = await prisma.visit.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingVisit) {
      return res.status(404).json({
        success: false,
        error: 'Visit not found'
      });
    }

    const updateData = {};
    
    if (visitType) updateData.visitType = visitType;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // If scheduledAt changes, regenerate queue number
    if (scheduledAt) {
      const newScheduledAt = new Date(scheduledAt);
      updateData.scheduledAt = newScheduledAt;

      // Check if date changed (not just time)
      const oldDate = new Date(existingVisit.scheduledAt);
      const dateChanged = 
        oldDate.getFullYear() !== newScheduledAt.getFullYear() ||
        oldDate.getMonth() !== newScheduledAt.getMonth() ||
        oldDate.getDate() !== newScheduledAt.getDate();

      if (dateChanged) {
        // Generate new queue number for new date
        const year = newScheduledAt.getFullYear().toString().slice(-2);
        const month = String(newScheduledAt.getMonth() + 1).padStart(2, '0');
        const day = String(newScheduledAt.getDate()).padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;

        // Get the highest queue number for the same date (excluding current visit)
        const lastVisit = await prisma.visit.findFirst({
          where: {
            queueNumber: {
              startsWith: datePrefix
            },
            id: {
              not: parseInt(id)
            }
          },
          orderBy: {
            queueNumber: 'desc'
          },
          select: {
            queueNumber: true
          }
        });

        let nextNumber = 1;
        if (lastVisit && lastVisit.queueNumber) {
          const lastSequence = parseInt(lastVisit.queueNumber.split('-')[1]);
          nextNumber = lastSequence + 1;
        }

        updateData.queueNumber = `${datePrefix}-${String(nextNumber).padStart(3, '0')}`;
      }
    }

    const visit = await prisma.visit.update({
      where: { id: parseInt(id) },
      data: updateData,
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
      data: { visit },
      message: 'Visit updated successfully'
    });

  } catch (error) {
    console.error('Update visit error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Visit not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while updating visit'
    });
  }
};

// @desc    Delete visit
// @route   DELETE /api/visits/:id
// @access  Private
const deleteVisit = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.visit.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Visit deleted successfully'
    });

  } catch (error) {
    console.error('Delete visit error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Visit not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while deleting visit'
    });
  }
};

module.exports = {
  getVisits,
  getVisit,
  createVisit,
  updateVisit,
  deleteVisit
};
