import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { patientService } from '../services'
import { Search, Plus, Eye, Edit, Trash2, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: ''
  })

  const fetchPatients = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...(search && { search })
      }
      
      const response = await patientService.getPatients(params)
      setPatients(response.data.patients)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients(currentPage, searchTerm)
  }, [currentPage])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPatients(1, searchTerm)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(id)
        toast.success('Patient deleted successfully')
        fetchPatients(currentPage, searchTerm)
      } catch (error) {
        toast.error('Failed to delete patient')
      }
    }
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-600">Manage patient information and records</p>
        </div>
        <Link to="/patients/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, MRN, or phone..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex gap-2">
            <select
              className="form-input min-w-[120px]"
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            
            <button className="btn btn-secondary">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card p-0">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Name</th>
                  <th>Age/Gender</th>
                  <th>Phone</th>
                  <th>Visits</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="font-mono text-sm">{patient.medicalRecordNo}</td>
                      <td>
                        <div className="font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div>{calculateAge(patient.dateOfBirth)} years</div>
                          <div className="text-gray-500">{patient.gender}</div>
                        </div>
                      </td>
                      <td className="text-sm">{patient.phone || '-'}</td>
                      <td>
                        <span className="badge badge-gray">
                          {patient._count?.visits || 0} visits
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {formatDate(patient.createdAt)}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/patients/${patient.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Patients