import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <div className="flex ml-2 md:mr-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-gray-900">
                🏥 Hospital Information System
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-2 text-sm rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar