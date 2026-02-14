import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  Settings,
  Activity
} from 'lucide-react'

const Sidebar = () => {
  const { user } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'FRONT_DESK', 'PHARMACY', 'LABORATORY']
    },
    {
      name: 'Patients',
      href: '/patients',
      icon: UserPlus,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'FRONT_DESK']
    },
    {
      name: 'Visits',
      href: '/visits',
      icon: Calendar,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'FRONT_DESK']
    },
    {
      name: 'Medical Records',
      href: '/records',
      icon: FileText,
      roles: ['ADMIN', 'DOCTOR', 'NURSE']
    },
    {
      name: 'Medicines',
      href: '/medicines',
      icon: Pill,
      roles: ['ADMIN', 'PHARMACY']
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard,
      roles: ['ADMIN', 'FRONT_DESK']
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['ADMIN']
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <aside className="fixed left-0 top-16 z-20 w-64 h-screen bg-white border-r border-gray-200">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group ${
                      isActive ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' : ''
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                  <span className="ml-3 font-medium">{item.name}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group ${
                    isActive ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' : ''
                  }`
                }
              >
                <Activity className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                <span className="ml-3 font-medium">Reports</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group ${
                    isActive ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' : ''
                  }`
                }
              >
                <Settings className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                <span className="ml-3 font-medium">Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar