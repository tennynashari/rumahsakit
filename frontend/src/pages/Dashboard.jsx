import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, Calendar, FileText, TrendingUp, Activity } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const { t } = useTranslation()

  const stats = [
    {
      name: 'totalPatients',
      value: '2,543',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'todayVisits',
      value: '87',
      change: '+5%',
      changeType: 'increase',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      name: 'pendingRecords',
      value: '23',
      change: '-2%',
      changeType: 'decrease',
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      name: 'monthlyRevenue',
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('dashboard.welcome')}, {user?.name}! ({user?.role})
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div className="ml-3 md:ml-4 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600">{t(`dashboard.${stat.name}`)}</p>
                  <p className="text-lg md:text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-2 hidden sm:inline">{t('dashboard.fromLastMonth')}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">{t('dashboard.recentActivities')}</h2>
          <button className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium">
            {t('dashboard.viewAll')}
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start">
                <div className={`flex-shrink-0 ${activity.color}`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                  <p className="text-xs md:text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <button className="btn btn-primary justify-center text-sm md:text-base">
          <UserPlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">New Patient</span>
          <span className="sm:hidden">New</span>
        </button>
        <button className="btn btn-secondary justify-center text-sm md:text-base">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Schedule Visit</span>
          <span className="sm:hidden">Schedule</span>
        </button>
        <button className="btn btn-secondary justify-center text-sm md:text-base">
          <FileText className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">View Records</span>
          <span className="sm:hidden">Records</span>
        </button>
        <button className="btn btn-secondary justify-center text-sm md:text-base">
          <TrendingUp className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">View Reports</span>
          <span className="sm:hidden">Reports</span>
        </button>
      </div>
    </div>
  )
}

export default Dashboard
