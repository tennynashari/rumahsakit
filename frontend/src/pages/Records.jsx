import React, { useState, useEffect } from 'react'
import { recordService, patientService, userService, visitService } from '../services'
import { FileText, Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const Records = () => {
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [visitSearch, setVisitSearch] = useState('')
  const [showVisitDropdown, setShowVisitDropdown] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [showModal, setShowModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [viewingRecord, setViewingRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    visitId: '',
    diagnosisCode: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: ''
  })

  useEffect(() => {
    fetchRecords()
    fetchPatients()
    fetchDoctors()
  }, [])

  const fetchRecords = async (page = pagination.page) => {
    try {
      setLoading(true)
      const response = await recordService.getRecords({ page, limit: pagination.limit })
      setRecords(response.data.records || [])
      setPagination(prev => ({
        ...prev,
        page: response.data.pagination?.page || page,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      }))
    } catch (error) {
      toast.error('Failed to fetch medical records')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchRecords(newPage)
  }

  const fetchPatients = async () => {
    try {
      const response = await patientService.getPatients({ limit: 1000 })
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

  const fetchVisits = async () => {
    try {
      const response = await visitService.getVisits()
      setVisits(response.data.visits || [])
    } catch (error) {
      console.error('Failed to fetch visits:', error)
    }
  }

  // Fetch visits when component mounts
  useEffect(() => {
    fetchVisits()
  }, [])

  // Filter visits based on selected patient
  const filteredVisits = formData.patientId 
    ? visits.filter(visit => visit.patientId === parseInt(formData.patientId))
    : []

  // Filter visits based on search
  const searchedVisits = filteredVisits.filter(visit => {
    const searchLower = visitSearch.toLowerCase()
    return (
      visit.visitType.toLowerCase().includes(searchLower) ||
      visit.status.toLowerCase().includes(searchLower) ||
      `#${visit.id}`.includes(searchLower)
    )
  })

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.medicalRecordNo.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const handlePatientSelect = (patient) => {
    setFormData({ ...formData, patientId: patient.id, visitId: '' })
    setPatientSearch(patient.name)
    setShowPatientDropdown(false)
    setVisitSearch('') // Reset visit search when patient changes
  }

  const handleVisitSelect = (visit) => {
    setFormData({ ...formData, visitId: visit.id })
    setVisitSearch(`Visit #${visit.id} - ${visit.visitType}`)
    setShowVisitDropdown(false)
  }

  const getSelectedPatientName = () => {
    if (formData.patientId) {
      const patient = patients.find(p => p.id === formData.patientId)
      return patient ? patient.name : ''
    }
    return ''
  }

  const getSelectedVisitLabel = () => {
    if (formData.visitId) {
      const visit = visits.find(v => v.id === parseInt(formData.visitId))
      return visit ? `Visit #${visit.id} - ${visit.visitType}` : ''
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      if (editingRecord) {
        await recordService.updateRecord(editingRecord.id, formData)
        toast.success('Medical record updated successfully')
      } else {
        await recordService.createRecord(formData)
        toast.success('Medical record created successfully')
      }
      setShowModal(false)
      setEditingRecord(null)
      resetForm()
      fetchRecords()
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${editingRecord ? 'update' : 'create'} medical record`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setFormData({
      patientId: record.patientId,
      doctorId: record.doctorId,
      visitId: record.visitId || '',
      diagnosisCode: record.diagnosisCode || '',
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment || '',
      prescription: record.prescription || ''
    })
    setPatientSearch(record.patient?.name || '')
    setVisitSearch(record.visitId ? `Visit #${record.visitId}` : '')
    setShowModal(true)
  }

  const handleView = async (id) => {
    try {
      const response = await recordService.getRecord(id)
      setViewingRecord(response.data.record)
      setViewModal(true)
    } catch (error) {
      toast.error('Failed to load medical record details')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await recordService.deleteRecord(id)
        toast.success('Medical record deleted successfully')
        fetchRecords()
      } catch (error) {
        toast.error('Failed to delete medical record')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      visitId: '',
      diagnosisCode: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      prescription: ''
    })
    setPatientSearch('')
    setShowPatientDropdown(false)
    setVisitSearch('')
    setShowVisitDropdown(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.diagnosisCode && record.diagnosisCode.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-sm text-gray-600">Electronic Medical Records (EMR) management</p>
        </div>
        <button onClick={() => { resetForm(); setEditingRecord(null); setShowModal(true) }} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Record
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-semibold text-gray-900">{records.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {records.filter(r => {
                  const recordDate = new Date(r.createdAt)
                  const now = new Date()
                  return recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {records.filter(r => {
                  const recordDate = new Date(r.createdAt)
                  const now = new Date()
                  return recordDate.toDateString() === now.toDateString()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name, doctor, diagnosis, or code..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Records Table */}
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
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Diagnosis Code</th>
                  <th>Diagnosis</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No medical records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td>
                        <div className="text-sm font-mono text-gray-900">#{record.id}</div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">{record.patient?.name}</div>
                        <div className="text-sm text-gray-500">{record.patient?.medicalRecordNo}</div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">{record.doctor?.name}</div>
                        <div className="text-sm text-gray-500">{record.doctor?.department}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-600">{record.diagnosisCode || '-'}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.diagnosis}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-600">
                          {formatDate(record.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleView(record.id)}
                            className="text-primary-600 hover:text-primary-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(record)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Record"
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
              {' '}({pagination.total} total records)
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRecord ? 'Edit Medical Record' : 'New Medical Record'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="form-label">Patient <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={patientSearch || getSelectedPatientName()}
                    onChange={(e) => {
                      setPatientSearch(e.target.value)
                      setShowPatientDropdown(true)
                      if (!e.target.value) {
                        setFormData({ ...formData, patientId: '', visitId: '' })
                      }
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    placeholder="Search patient by name or MRN..."
                    disabled={editingRecord}
                    autoComplete="off"
                  />
                  {showPatientDropdown && !editingRecord && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                          <div
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">{patient.medicalRecordNo}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">No patients found</div>
                      )}
                    </div>
                  )}
                  {editingRecord && (
                    <p className="text-xs text-gray-500 mt-1">Patient cannot be changed</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Doctor <span className="text-red-500">*</span></label>
                  <select
                    required
                    className="form-input"
                    value={formData.doctorId}
                    onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    disabled={editingRecord}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Diagnosis Code (ICD-10)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.diagnosisCode}
                    onChange={(e) => setFormData({...formData, diagnosisCode: e.target.value})}
                    placeholder="e.g., J00, I10"
                  />
                </div>

                <div className="relative">
                  <label className="form-label">Visit (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={visitSearch || getSelectedVisitLabel()}
                    onChange={(e) => {
                      setVisitSearch(e.target.value)
                      setShowVisitDropdown(true)
                      if (!e.target.value) {
                        setFormData({ ...formData, visitId: '' })
                      }
                    }}
                    onFocus={() => setShowVisitDropdown(true)}
                    placeholder={formData.patientId ? 'Search visit by ID, type, or status...' : 'Select Patient First'}
                    disabled={!formData.patientId}
                    autoComplete="off"
                  />
                  {showVisitDropdown && formData.patientId && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchedVisits.length > 0 ? (
                        searchedVisits.map(visit => (
                          <div
                            key={visit.id}
                            onClick={() => handleVisitSelect(visit)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">Visit #{visit.id} - {visit.visitType}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(visit.scheduledAt).toLocaleDateString()} • {visit.status}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                visit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                visit.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                visit.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {visit.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          {filteredVisits.length === 0 ? 'No visits found for this patient' : 'No matching visits'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Symptoms <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows="3"
                    className="form-input"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    placeholder="Describe patient symptoms..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Diagnosis <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows="3"
                    className="form-input"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    placeholder="Enter diagnosis..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Treatment</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    value={formData.treatment}
                    onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    placeholder="Treatment plan and procedures..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Prescription</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    value={formData.prescription}
                    onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                    placeholder="Medication and dosage..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingRecord(null)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingRecord ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingRecord ? 'Update Record' : 'Create Record'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Record Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Record ID</label>
                  <p className="text-gray-900 font-mono">#{viewingRecord.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date Created</label>
                  <p className="text-gray-900">{formatDate(viewingRecord.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Patient</label>
                  <p className="text-gray-900">{viewingRecord.patient?.name}</p>
                  <p className="text-sm text-gray-500">{viewingRecord.patient?.medicalRecordNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Doctor</label>
                  <p className="text-gray-900">{viewingRecord.doctor?.name}</p>
                  <p className="text-sm text-gray-500">{viewingRecord.doctor?.department}</p>
                </div>
                {viewingRecord.diagnosisCode && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Diagnosis Code</label>
                    <p className="text-gray-900">{viewingRecord.diagnosisCode}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Symptoms</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{viewingRecord.symptoms}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Diagnosis</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{viewingRecord.diagnosis}</p>
                </div>
              </div>

              {viewingRecord.treatment && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Treatment</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingRecord.treatment}</p>
                  </div>
                </div>
              )}

              {viewingRecord.prescription && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Prescription</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingRecord.prescription}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t mt-6">
              <button
                onClick={() => {
                  setViewModal(false)
                  setViewingRecord(null)
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Records