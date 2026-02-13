import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Users, UserPlus, Calendar, FileText, TrendingUp, Activity } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  const stats = [
    {
      name: 'Total Patients',
      value: '2,543',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Today Visits',
      value: '87',
      change: '+5%',
      changeType: 'increase',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      name: 'Pending Records',
      value: '23',
      change: '-2%',
      changeType: 'decrease',
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      name: 'Monthly Revenue',
      value: 'Rp 125.430.000',
      change: '+18%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'New Patient',
      description: 'Budi Santoso registered as new patient',
      time: '5 minutes ago',
      icon: UserPlus,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'Visit Completed',
      description: 'dr. Sarah completed consultation with patient',
      time: '15 minutes ago',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'New Record',
      description: 'Medical record updated for patient MRN20241024001',
      time: '1 hour ago',
      icon: FileText,
      color: 'text-yellow-600'
    }
  ]

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
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
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-2">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start">
                <div className={`flex-shrink-0 ${activity.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="btn btn-primary justify-center">
          <UserPlus className="w-4 h-4 mr-2" />
          New Patient
        </button>
        <button className="btn btn-secondary justify-center">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Visit
        </button>
        <button className="btn btn-secondary justify-center">
          <FileText className="w-4 h-4 mr-2" />
          View Records
        </button>
        <button className="btn btn-secondary justify-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          View Reports
        </button>
      </div>
    </div>
  )
}

export default Dashboard
