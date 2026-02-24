const { validationResult } = require('express-validator');
const prisma = require('../database/prisma');

// Generate unique Registration Number for inpatient
const generateRegistrationNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const prefix = `INP${year}${month}${day}`;
  
  // Find the last registration for today
  const lastOccupancy = await prisma.roomOccupancy.findFirst({
    where: {
      registrationNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      registrationNumber: 'desc'
    }
  });

  let sequence = 1;
  if (lastOccupancy) {
    const lastSequence = parseInt(lastOccupancy.registrationNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

// Calculate days between two dates
const calculateDays = (checkIn, checkOut) => {
  const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1; // Minimum 1 day
};

// @desc    Get all active inpatients
// @route   GET /api/inpatients
// @access  Private
const getInpatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { roomType, floor, doctorId, search, startDate, endDate } = req.query;
    
    // Build where clause
    const where = {
      status: 'ACTIVE'
    };
    
    if (search) {
      where.OR = [
        {
          patient: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          patient: {
            medicalRecordNo: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }
    
    if (doctorId) {
      where.doctorId = parseInt(doctorId);
    }
    
    if (roomType) {
      where.room = {
        roomType
      };
    }
    
    if (floor) {
      where.room = {
        ...where.room,
        floor: parseInt(floor)
      };
    }
    
    if (startDate && endDate) {
      where.checkedInAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    const [occupancies, total] = await Promise.all([
      prisma.roomOccupancy.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          checkedInAt: 'desc'
        },
        include: {
          patient: {
            select: {
              id: true,
              medicalRecordNo: true,
              name: true,
              gender: true,
              dateOfBirth: true,
              phone: true
            }
          },
          room: {
            select: {
              id: true,
              roomNumber: true,
              roomName: true,
              roomType: true,
              floor: true,
              pricePerDay: true
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
      prisma.roomOccupancy.count({ where })
    ]);
    
    // Calculate days for each occupancy
    const occupanciesWithDays = occupancies.map(occ => {
      const days = calculateDays(occ.checkedInAt, new Date());
      return {
        ...occ,
        currentDays: days
      };
    });
    
    res.json({
      success: true,
      data: {
        inpatients: occupanciesWithDays,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inpatients error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching inpatients'
    });
  }
};

// @desc    Get single occupancy detail
// @route   GET /api/inpatients/:id
// @access  Private
const getInpatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const occupancy = await prisma.roomOccupancy.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: true,
        room: true,
        doctor: {
          select: {
            id: true,
            name: true,
            department: true
          }
        },
        billing: true
      }
    });
    
    if (!occupancy) {
      return res.status(404).json({
        success: false,
        error: 'Inpatient record not found'
      });
    }
    
    const days = occupancy.checkedOutAt 
      ? occupancy.actualDays
      : calculateDays(occupancy.checkedInAt, new Date());
    
    res.json({
      success: true,
      data: {
        occupancy: {
          ...occupancy,
          currentDays: days
        }
      }
    });
  } catch (error) {
    console.error('Get inpatient error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching inpatient'
    });
  }
};

// @desc    Check-in patient to room
// @route   POST /api/inpatients/check-in
// @access  Private
const checkInPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      patientId,
      roomId,
      bedNumber,
      doctorId,
      checkedInAt,
      estimatedCheckoutAt,
      initialDiagnosis,
      careClass,
      notes
    } = req.body;
    
    // Check if patient already has active occupancy
    const existingOccupancy = await prisma.roomOccupancy.findFirst({
      where: {
        patientId: parseInt(patientId),
        status: 'ACTIVE'
      }
    });
    
    if (existingOccupancy) {
      return res.status(400).json({
        success: false,
        error: 'Patient already has an active room occupancy'
      });
    }
    
    // Check if room is available
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) },
      include: {
        occupancies: {
          where: { status: 'ACTIVE' }
        }
      }
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    if (room.status !== 'AVAILABLE' && room.status !== 'RESERVED') {
      return res.status(400).json({
        success: false,
        error: 'Room is not available for check-in'
      });
    }
    
    // Check bed availability for multi-bed rooms
    if (room.bedCapacity > 1) {
      if (!bedNumber) {
        return res.status(400).json({
          success: false,
          error: 'Bed number is required for multi-bed room'
        });
      }
      
      const bedOccupied = room.occupancies.some(occ => occ.bedNumber === parseInt(bedNumber));
      if (bedOccupied) {
        return res.status(400).json({
          success: false,
          error: 'Bed number is already occupied'
        });
      }
    }
    
    // Check if room will be fully occupied
    const willBeFullyOccupied = room.occupancies.length + 1 >= room.bedCapacity;
    
    // Generate registration number
    const registrationNumber = await generateRegistrationNumber();
    
    // Create occupancy
    const occupancy = await prisma.roomOccupancy.create({
      data: {
        registrationNumber,
        patientId: parseInt(patientId),
        roomId: parseInt(roomId),
        bedNumber: bedNumber ? parseInt(bedNumber) : null,
        doctorId: parseInt(doctorId),
        checkedInAt: checkedInAt ? new Date(checkedInAt) : new Date(),
        estimatedCheckoutAt: estimatedCheckoutAt ? new Date(estimatedCheckoutAt) : null,
        initialDiagnosis,
        careClass,
        notes
      },
      include: {
        patient: true,
        room: true,
        doctor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Update room status
    await prisma.room.update({
      where: { id: parseInt(roomId) },
      data: {
        status: willBeFullyOccupied ? 'OCCUPIED' : 'OCCUPIED'
      }
    });
    
    res.status(201).json({
      success: true,
      data: { occupancy },
      message: 'Patient checked in successfully'
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking in patient'
    });
  }
};

// @desc    Update occupancy (change room)
// @route   PUT /api/inpatients/:id
// @access  Private
const updateOccupancy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      roomId,
      bedNumber,
      doctorId,
      estimatedCheckoutAt,
      initialDiagnosis,
      careClass,
      notes
    } = req.body;
    
    const occupancy = await prisma.roomOccupancy.findUnique({
      where: { id: parseInt(id) },
      include: { room: true }
    });
    
    if (!occupancy) {
      return res.status(404).json({
        success: false,
        error: 'Occupancy not found'
      });
    }
    
    if (occupancy.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update inactive occupancy'
      });
    }
    
    let newRoomId = occupancy.roomId;
    let newBedNumber = occupancy.bedNumber;
    
    // If changing room
    if (roomId && parseInt(roomId) !== occupancy.roomId) {
      const newRoom = await prisma.room.findUnique({
        where: { id: parseInt(roomId) },
        include: {
          occupancies: {
            where: { status: 'ACTIVE' }
          }
        }
      });
      
      if (!newRoom) {
        return res.status(404).json({
          success: false,
          error: 'New room not found'
        });
      }
      
      if (newRoom.status !== 'AVAILABLE' && newRoom.status !== 'RESERVED') {
        return res.status(400).json({
          success: false,
          error: 'New room is not available'
        });
      }
      
      // Check bed availability for multi-bed rooms
      if (newRoom.bedCapacity > 1) {
        if (!bedNumber) {
          return res.status(400).json({
            success: false,
            error: 'Bed number is required for multi-bed room'
          });
        }
        
        const bedOccupied = newRoom.occupancies.some(occ => occ.bedNumber === parseInt(bedNumber));
        if (bedOccupied) {
          return res.status(400).json({
            success: false,
            error: 'Bed number is already occupied in new room'
          });
        }
      }
      
      newRoomId = parseInt(roomId);
      newBedNumber = bedNumber ? parseInt(bedNumber) : null;
      
      // Update old room status
      const oldRoomActiveOccupancies = await prisma.roomOccupancy.count({
        where: {
          roomId: occupancy.roomId,
          status: 'ACTIVE',
          id: { not: parseInt(id) }
        }
      });
      
      if (oldRoomActiveOccupancies === 0) {
        await prisma.room.update({
          where: { id: occupancy.roomId },
          data: { status: 'CLEANING' }
        });
      }
      
      // Update new room status
      const newRoomWillBeFull = newRoom.occupancies.length + 1 >= newRoom.bedCapacity;
      await prisma.room.update({
        where: { id: parseInt(roomId) },
        data: { status: newRoomWillBeFull ? 'OCCUPIED' : 'OCCUPIED' }
      });
    }
    
    // Update occupancy
    const updatedOccupancy = await prisma.roomOccupancy.update({
      where: { id: parseInt(id) },
      data: {
        ...(roomId && { roomId: newRoomId }),
        ...(bedNumber !== undefined && { bedNumber: newBedNumber }),
        ...(doctorId && { doctorId: parseInt(doctorId) }),
        ...(estimatedCheckoutAt && { estimatedCheckoutAt: new Date(estimatedCheckoutAt) }),
        ...(initialDiagnosis !== undefined && { initialDiagnosis }),
        ...(careClass !== undefined && { careClass }),
        ...(notes !== undefined && { notes })
      },
      include: {
        patient: true,
        room: true,
        doctor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: { occupancy: updatedOccupancy },
      message: 'Occupancy updated successfully'
    });
  } catch (error) {
    console.error('Update occupancy error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating occupancy'
    });
  }
};

// @desc    Check-out patient from room
// @route   POST /api/inpatients/:id/check-out
// @access  Private
const checkOutPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      checkedOutAt,
      dischargeCondition,
      finalDiagnosis,
      dischargeNotes
    } = req.body;
    
    const occupancy = await prisma.roomOccupancy.findUnique({
      where: { id: parseInt(id) },
      include: {
        room: true,
        patient: true
      }
    });
    
    if (!occupancy) {
      return res.status(404).json({
        success: false,
        error: 'Occupancy not found'
      });
    }
    
    if (occupancy.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Patient is not currently checked in'
      });
    }
    
    const checkOutDate = checkedOutAt ? new Date(checkedOutAt) : new Date();
    const actualDays = calculateDays(occupancy.checkedInAt, checkOutDate);
    const totalRoomCost = parseFloat(occupancy.room.pricePerDay) * actualDays;
    
    // Create billing entry
    const billing = await prisma.billing.create({
      data: {
        patientId: occupancy.patientId,
        visitId: null,
        items: [
          {
            name: `Room ${occupancy.room.roomNumber} - ${occupancy.room.roomType}`,
            quantity: actualDays,
            price: parseFloat(occupancy.room.pricePerDay),
            total: totalRoomCost
          }
        ],
        subtotal: totalRoomCost,
        tax: 0,
        discount: 0,
        total: totalRoomCost,
        status: 'UNPAID'
      }
    });
    
    // Update occupancy
    const updatedOccupancy = await prisma.roomOccupancy.update({
      where: { id: parseInt(id) },
      data: {
        checkedOutAt: checkOutDate,
        actualDays,
        totalRoomCost,
        dischargeCondition,
        finalDiagnosis,
        dischargeNotes,
        status: 'CHECKED_OUT',
        billingId: billing.id
      },
      include: {
        patient: true,
        room: true,
        doctor: {
          select: {
            id: true,
            name: true
          }
        },
        billing: true
      }
    });
    
    // Update room status
    const remainingOccupancies = await prisma.roomOccupancy.count({
      where: {
        roomId: occupancy.roomId,
        status: 'ACTIVE'
      }
    });
    
    if (remainingOccupancies === 0) {
      await prisma.room.update({
        where: { id: occupancy.roomId },
        data: { status: 'CLEANING' }
      });
    }
    
    res.json({
      success: true,
      data: {
        occupancy: updatedOccupancy,
        billing
      },
      message: 'Patient checked out successfully'
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking out patient'
    });
  }
};

// @desc    Get occupancy history
// @route   GET /api/inpatients/history
// @access  Private
const getOccupancyHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { patientId, startDate, endDate } = req.query;
    
    const where = {
      status: 'CHECKED_OUT'
    };
    
    if (patientId) {
      where.patientId = parseInt(patientId);
    }
    
    if (startDate && endDate) {
      where.checkedInAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    const [history, total] = await Promise.all([
      prisma.roomOccupancy.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          checkedOutAt: 'desc'
        },
        include: {
          patient: {
            select: {
              id: true,
              medicalRecordNo: true,
              name: true
            }
          },
          room: {
            select: {
              roomNumber: true,
              roomType: true
            }
          },
          doctor: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.roomOccupancy.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching history'
    });
  }
};

module.exports = {
  getInpatients,
  getInpatient,
  checkInPatient,
  updateOccupancy,
  checkOutPatient,
  getOccupancyHistory
};
