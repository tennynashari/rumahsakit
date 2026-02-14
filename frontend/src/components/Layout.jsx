import React from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <div className="flex pt-16 print:pt-0">
        <div className="print:hidden">
          <Sidebar />
        </div>
        
        <main className="flex-1 p-6 ml-64 print:ml-0 print:p-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout