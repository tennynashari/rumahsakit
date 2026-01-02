import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardService } from '../services'
import { Users, UserPlus, Calendar, FileText, TrendingUp, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, activitiesResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivities({ limit: 5 })
      ])
      
      if (statsResponse.success) {
        setStats(statsResponse.stats)
      }
      
      if (activitiesResponse.success) {
        setActivities(activitiesResponse.activities)
      }
    } catch (error) {
      console.error('Fetch dashboard data error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const statsCards = stats ? [
    {
      name: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      change: `${stats.changes.patients > 0 ? '+' : ''}${stats.changes.patients}%`,
      changeType: stats.changes.patients >= 0 ? 'increase' : 'decrease',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Today Visits',
      value: stats.todayVisits.toString(),
      change: `${stats.changes.visits > 0 ? '+' : ''}${stats.changes.visits}%`,
      changeType: stats.changes.visits >= 0 ? 'increase' : 'decrease',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      name: 'Pending Records',
      value: stats.pendingRecords.toString(),
      change: 'Need attention',
      changeType: stats.pendingRecords > 0 ? 'decrease' : 'increase',
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      change: `${stats.changes.revenue > 0 ? '+' : ''}${stats.changes.revenue}%`,
      changeType: stats.changes.revenue >= 0 ? 'increase' : 'decrease',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ] : []

  const getActivityIcon = (iconName) => {
    const icons = {
      UserPlus: UserPlus,
      Activity: Activity,
      FileText: FileText
    }
    return icons[iconName] || Activity
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {user?.name}! ({user?.role})
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {activities.length > 0 ? activities.map((activity) => {
              const Icon = getActivityIcon(activity.icon)
              return (
                <div key={activity.id} className="flex items-start">
                  <div className={`flex-shrink-0 ${activity.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              )
            }) : (
              <p className="text-sm text-gray-500">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {user?.role === 'ADMIN' || user?.role === 'FRONT_DESK' ? (
              <button 
                onClick={() => navigate('/patients')}
                className="w-full btn btn-primary justify-start"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register New Patient
              </button>
            ) : null}
            
            {user?.role === 'DOCTOR' || user?.role === 'NURSE' ? (
              <>
                <button 
                  onClick={() => navigate('/visits')}
                  className="w-full btn btn-secondary justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </button>
                <button 
                  onClick={() => navigate('/records')}
                  className="w-full btn btn-secondary justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Add Medical Record
                </button>
              </>
            ) : null}
            
            {user?.role === 'PHARMACY' ? (
              <button 
                onClick={() => navigate('/medicines')}
                className="w-full btn btn-secondary justify-start"
              >
                <Activity className="w-4 h-4 mr-2" />
                Update Stock
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Database: Online</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">API: Healthy</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Backup: Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard