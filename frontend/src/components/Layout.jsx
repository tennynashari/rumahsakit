import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>
      
      <div className="flex pt-16 print:pt-0">
        <div className="print:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 print:ml-0 print:p-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout