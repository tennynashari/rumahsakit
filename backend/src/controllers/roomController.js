const { validationResult } = require('express-validator');
const prisma = require('../database/prisma');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { roomType, floor, status, search } = req.query;
    
    // Build where clause
    const where = {
      isActive: true,
      deletedAt: null
    };
    
    if (roomType) {
      where.roomType = roomType;
    }
    
    if (floor) {
      where.floor = parseInt(floor);
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { roomName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { floor: 'asc' },
          { roomNumber: 'asc' }
        ],
        include: {
          _count: {
            select: {
              occupancies: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      }),
      prisma.room.count({ where })
    ]);
    
    // Calculate available beds for each room
    const roomsWithAvailability = rooms.map(room => {
      const activeOccupancies = room._count.occupancies;
      return {
        ...room,
        currentOccupancy: activeOccupancies,
        availableBeds: room.bedCapacity - activeOccupancies
      };
    });
    
    res.json({
      success: true,
      data: {
        rooms: roomsWithAvailability,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching rooms'
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
const getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await prisma.room.findUnique({
      where: { id: parseInt(id) },
      include: {
        occupancies: {
          where: { status: 'ACTIVE' },
          include: {
            patient: {
              select: {
                id: true,
                medicalRecordNo: true,
                name: true,
                gender: true
              }
            },
            doctor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!room || room.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: { room }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching room'
    });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin only)
const createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      roomNumber,
      roomName,
      roomType,
      floor,
      building,
      bedCapacity,
      pricePerDay,
      facilities,
      description,
      images
    } = req.body;
    
    // Check if room number already exists
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber }
    });
    
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        error: 'Room number already exists'
      });
    }
    
    const room = await prisma.room.create({
      data: {
        roomNumber,
        roomName,
        roomType,
        floor: parseInt(floor),
        building,
        bedCapacity: parseInt(bedCapacity) || 1,
        pricePerDay: parseFloat(pricePerDay),
        facilities: facilities || [],
        description,
        images: images || []
      }
    });
    
    res.status(201).json({
      success: true,
      data: { room }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating room'
    });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin only)
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      roomName,
      roomType,
      floor,
      building,
      bedCapacity,
      status,
      pricePerDay,
      facilities,
      description,
      images,
      isActive
    } = req.body;
    
    const room = await prisma.room.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!room || room.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    const updatedRoom = await prisma.room.update({
      where: { id: parseInt(id) },
      data: {
        ...(roomName !== undefined && { roomName }),
        ...(roomType !== undefined && { roomType }),
        ...(floor !== undefined && { floor: parseInt(floor) }),
        ...(building !== undefined && { building }),
        ...(bedCapacity !== undefined && { bedCapacity: parseInt(bedCapacity) }),
        ...(status !== undefined && { status }),
        ...(pricePerDay !== undefined && { pricePerDay: parseFloat(pricePerDay) }),
        ...(facilities !== undefined && { facilities }),
        ...(description !== undefined && { description }),
        ...(images !== undefined && { images }),
        ...(isActive !== undefined && { isActive })
      }
    });
    
    res.json({
      success: true,
      data: { room: updatedRoom }
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating room'
    });
  }
};

// @desc    Delete room (soft delete)
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await prisma.room.findUnique({
      where: { id: parseInt(id) },
      include: {
        occupancies: {
          where: { status: 'ACTIVE' }
        }
      }
    });
    
    if (!room || room.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    // Check if room has active occupancies
    if (room.occupancies.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete room with active occupancies'
      });
    }
    
    await prisma.room.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting room'
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/rooms/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      cleaningRooms,
      activeOccupancies,
      roomsByType
    ] = await Promise.all([
      prisma.room.count({ where: { isActive: true, deletedAt: null } }),
      prisma.room.count({ 
        where: { 
          status: 'AVAILABLE',
          isActive: true,
          deletedAt: null
        }
      }),
      prisma.room.count({ 
        where: { 
          status: 'OCCUPIED',
          isActive: true,
          deletedAt: null
        }
      }),
      prisma.room.count({ 
        where: { 
          status: 'MAINTENANCE',
          isActive: true,
          deletedAt: null
        }
      }),
      prisma.room.count({ 
        where: { 
          status: 'CLEANING',
          isActive: true,
          deletedAt: null
        }
      }),
      prisma.roomOccupancy.findMany({
        where: { status: 'ACTIVE' },
        include: {
          room: {
            select: {
              pricePerDay: true
            }
          }
        }
      }),
      prisma.room.groupBy({
        by: ['roomType'],
        where: {
          isActive: true,
          deletedAt: null
        },
        _count: true
      })
    ]);
    
    // Calculate estimated daily revenue
    const estimatedDailyRevenue = activeOccupancies.reduce((sum, occ) => {
      return sum + parseFloat(occ.room.pricePerDay);
    }, 0);
    
    // Calculate occupancy rate
    const usableRooms = totalRooms - maintenanceRooms;
    const occupancyRate = usableRooms > 0 
      ? ((occupiedRooms / usableRooms) * 100).toFixed(2)
      : 0;
    
    // Format rooms by type
    const roomsByTypeFormatted = roomsByType.reduce((acc, item) => {
      acc[item.roomType] = item._count;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        cleaningRooms,
        occupancyRate: parseFloat(occupancyRate),
        estimatedDailyRevenue,
        activeOccupancies: activeOccupancies.length,
        roomsByType: roomsByTypeFormatted
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching dashboard stats'
    });
  }
};

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getDashboardStats
};
