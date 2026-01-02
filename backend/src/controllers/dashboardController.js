const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total patients count
    const totalPatients = await prisma.patient.count();

    // Get today's visits count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayVisits = await prisma.visit.count({
      where: {
        scheduledAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get pending medical records (visits completed but no records)
    const completedVisits = await prisma.visit.findMany({
      where: {
        status: 'COMPLETED'
      },
      select: {
        id: true
      }
    });

    const visitIds = completedVisits.map(v => v.id);
    const recordedVisitIds = await prisma.medicalRecord.findMany({
      where: {
        visitId: {
          in: visitIds
        }
      },
      select: {
        visitId: true
      }
    });

    const recordedIds = recordedVisitIds.map(r => r.visitId);
    const pendingRecords = visitIds.filter(id => !recordedIds.includes(id)).length;

    // Get monthly revenue (current month)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const monthlyBillings = await prisma.billing.findMany({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        },
        status: {
          in: ['PAID', 'PARTIALLY_PAID']
        }
      },
      select: {
        total: true,
        status: true
      }
    });

    const monthlyRevenue = monthlyBillings.reduce((sum, bill) => {
      // For PAID bills, count full total; for PARTIALLY_PAID, we'll count full total too 
      // (ideally you'd track actual paid amount, but Billing model doesn't have amountPaid field)
      return sum + Number(bill.total);
    }, 0);

    // Get previous month stats for comparison
    const prevFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevLastDay = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const prevMonthPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: prevFirstDay,
          lte: prevLastDay
        }
      }
    });

    const currentMonthPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      }
    });

    const patientChange = prevMonthPatients > 0 
      ? ((currentMonthPatients - prevMonthPatients) / prevMonthPatients * 100).toFixed(1)
      : 0;

    // Get yesterday's visits for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayVisits = await prisma.visit.count({
      where: {
        scheduledAt: {
          gte: yesterday,
          lt: today
        }
      }
    });

    const visitChange = yesterdayVisits > 0
      ? ((todayVisits - yesterdayVisits) / yesterdayVisits * 100).toFixed(1)
      : 0;

    // Get previous month revenue for comparison
    const prevMonthBillings = await prisma.billing.findMany({
      where: {
        createdAt: {
          gte: prevFirstDay,
          lte: prevLastDay
        },
        status: {
          in: ['PAID', 'PARTIALLY_PAID']
        }
      },
      select: {
        total: true
      }
    });

    const prevMonthRevenue = prevMonthBillings.reduce((sum, bill) => sum + Number(bill.total), 0);
    const revenueChange = prevMonthRevenue > 0
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        totalPatients,
        todayVisits,
        pendingRecords,
        monthlyRevenue,
        changes: {
          patients: patientChange,
          visits: visitChange,
          revenue: revenueChange
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent patients
    const recentPatients = await prisma.patient.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        medicalRecordNo: true,
        createdAt: true
      }
    });

    // Get recent completed visits
    const recentVisits = await prisma.visit.findMany({
      take: 3,
      where: {
        status: 'COMPLETED'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        patient: {
          select: {
            name: true,
            medicalRecordNo: true
          }
        },
        doctor: {
          select: {
            name: true
          }
        }
      }
    });

    // Get recent medical records
    const recentRecords = await prisma.medicalRecord.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        patient: {
          select: {
            name: true,
            medicalRecordNo: true
          }
        }
      }
    });

    // Combine and format activities
    const activities = [];

    recentPatients.forEach(patient => {
      activities.push({
        id: `patient-${patient.id}`,
        type: 'New Patient',
        description: `${patient.name} registered as new patient (${patient.medicalRecordNo})`,
        time: patient.createdAt,
        icon: 'UserPlus',
        color: 'text-blue-600'
      });
    });

    recentVisits.forEach(visit => {
      activities.push({
        id: `visit-${visit.id}`,
        type: 'Visit Completed',
        description: `${visit.doctor?.name || 'Doctor'} completed consultation with ${visit.patient.name}`,
        time: visit.updatedAt,
        icon: 'Activity',
        color: 'text-green-600'
      });
    });

    recentRecords.forEach(record => {
      activities.push({
        id: `record-${record.id}`,
        type: 'New Record',
        description: `Medical record updated for patient ${record.patient.medicalRecordNo}`,
        time: record.createdAt,
        icon: 'FileText',
        color: 'text-yellow-600'
      });
    });

    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, limit);

    // Format relative time
    const formatRelativeTime = (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    limitedActivities.forEach(activity => {
      activity.time = formatRelativeTime(activity.time);
    });

    res.json({
      success: true,
      activities: limitedActivities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activities',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities
};
