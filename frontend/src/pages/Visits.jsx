import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { visitService, patientService, userService } from '../services'
import { Calendar, Plus, Eye, Edit, Trash2, Search, Filter, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const Visits = () => {
  const navigate = useNavigate()
  const [visits, setVisits] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    visitType: 'GENERAL_CHECKUP',
    scheduledAt: '',
    notes: ''
  })
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    fetchVisits()
    fetchPatients()
    fetchDoctors()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPatientDropdown && !event.target.closest('.patient-autocomplete')) {
        setShowPatientDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPatientDropdown])

  const fetchVisits = async (page = pagination.page) => {
    try {
      setLoading(true)
      const response = await visitService.getVisits({ page, limit: pagination.limit })
      setVisits(response.data.visits || [])
      setPagination(prev => ({
        ...prev,
        page: response.data.pagination?.page || page,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      }))
    } catch (error) {
      toast.error('Failed to fetch schedules')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchVisits(newPage)
  }

  const fetchPatients = async () => {
    try {
      const response = await patientService.getPatients()
      setPatients(response.data.patients || [])
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await userService.getUsers()
      const doctorsList = (response.data.users || []).filter(
        user => user.role === 'DOCTOR'
      )
      setDoctors(doctorsList)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await visitService.createVisit(formData)
      toast.success('Schedule created successfully')
      setShowModal(false)
      fetchVisits()
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create schedule')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await visitService.deleteVisit(id)
        toast.success('Schedule deleted successfully')
        fetchVisits()
      } catch (error) {
        toast.error('Failed to delete schedule')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      visitType: 'GENERAL_CHECKUP',
      scheduledAt: '',
      notes: ''
    })
    setPatientSearch('')
    setSelectedPatient(null)
    setShowPatientDropdown(false)
  }

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setFormData({ ...formData, patientId: patient.id })
    setPatientSearch(patient.name)
    setShowPatientDropdown(false)
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.medicalRecordNo?.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = !searchTerm || 
      visit.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || visit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule & Appointments</h1>
          <p className="text-sm text-gray-600">Manage patient schedules and appointments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Visit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Schedules</p>
              <p className="text-2xl font-semibold text-gray-900">{visits.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">
                {visits.filter(v => v.status === 'SCHEDULED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {visits.filter(v => v.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {visits.filter(v => v.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient or doctor name..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-input min-w-[150px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
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
                  <th>Queue #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No schedules found
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td>
                        <div className="text-sm font-mono font-bold text-primary-600">
                          {visit.queueNumber || `#${visit.id}`}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">
                          {visit.patient?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {visit.patient?.medicalRecordNo}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">
                          {visit.doctor?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {visit.doctor?.department}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{visit.visitType}</span>
                      </td>
                      <td className="text-sm">
                        {formatDateTime(visit.scheduledAt)}
                      </td>
                      <td>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(visit.status)}`}>
                          {visit.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/visits/${visit.id}`)}
                            className="text-primary-600 hover:text-primary-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/visits/${visit.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit Visit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(visit.id)}
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
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{pagination.page}</span> of{' '}
              <span className="font-medium">{pagination.pages}</span>
              {' '}({pagination.total} total schedules)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {[...Array(pagination.pages)].map((_, index) => {
                  const pageNum = index + 1
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          pagination.page === pageNum
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return <span key={pageNum} className="px-2">...</span>
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Visit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule Visit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative patient-autocomplete">
                <label className="form-label">Patient <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="form-input pr-10"
                    placeholder="Search patient by name or medical record no..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value)
                      setShowPatientDropdown(true)
                      if (!e.target.value) {
                        setSelectedPatient(null)
                        setFormData({ ...formData, patientId: '' })
                      }
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                {/* Autocomplete Dropdown */}
                {showPatientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(patient => (
                        <div
                          key={patient.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            MR: {patient.medicalRecordNo} • DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        {patientSearch ? 'No patients found' : 'Type to search patients...'}
                      </div>
                    )}
                  </div>
                )}
                
                {selectedPatient && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <div className="font-medium text-blue-900">{selectedPatient.name}</div>
                    <div className="text-blue-700">Medical Record: {selectedPatient.medicalRecordNo}</div>
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Doctor <span className="text-red-500">*</span></label>
                <select
                  required
                  className="form-input"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.department}
                    </option>
                  ))}
                </select>
                {doctors.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">No doctors available</p>
                )}
              </div>

              <div>
                <label className="form-label">Schedule Type <span className="text-red-500">*</span></label>
                <select
                  required
                  className="form-input"
                  value={formData.visitType}
                  onChange={(e) => setFormData({...formData, visitType: e.target.value})}
                >
                  <option value="GENERAL_CHECKUP">General Checkup</option>
                  <option value="OUTPATIENT">Outpatient</option>
                  <option value="INPATIENT">Inpatient</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              <div>
                <label className="form-label">Scheduled Date & Time <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                />
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea
                  rows="3"
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Visits