import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { patientService } from '../services'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, User, Heart, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const PatientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatient()
  }, [id])

  const fetchPatient = async () => {
    try {
      setLoading(true)
      const response = await patientService.getPatient(id)
      setPatient(response.data.patient)
    } catch (error) {
      toast.error('Failed to fetch patient details')
      navigate('/patients')
    } finally {
      setLoading(false)
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
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
      </div>
    )
  }

  const emergencyContact = patient.emergencyContact || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/patients')}
            className="btn btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-sm text-gray-600">MRN: {patient.medicalRecordNo}</p>
          </div>
        </div>
        <Link
          to={`/patients/${id}/edit`}
          className="btn btn-primary"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{patient.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Medical Record Number</label>
                <p className="text-gray-900 font-mono">{patient.medicalRecordNo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900">{formatDate(patient.dateOfBirth)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Age</label>
                <p className="text-gray-900">{calculateAge(patient.dateOfBirth)} years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p className="text-gray-900">{patient.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Blood Type</label>
                <p className="text-gray-900">{emergencyContact.bloodType || 'Not recorded'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{patient.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{emergencyContact.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900">{patient.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Heart className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Blood Type</label>
                  <p className="text-gray-900">{emergencyContact.bloodType || 'Not recorded'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Known Allergies</label>
                  <p className="text-gray-900">{emergencyContact.allergies || 'None recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{emergencyContact.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{emergencyContact.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{emergencyContact.email || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Visits</span>
                <span className="font-semibold text-gray-900">{patient._count?.visits || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Medical Records</span>
                <span className="font-semibold text-gray-900">{patient._count?.medicalRecords || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Billings</span>
                <span className="font-semibold text-gray-900">{patient._count?.billings || 0}</span>
              </div>
              <div className="pt-3 border-t">
                <label className="text-sm font-medium text-gray-600">Registered</label>
                <p className="text-sm text-gray-900">{formatDate(patient.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Recent Visits */}
          {patient.visits && patient.visits.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Visits</h3>
              <div className="space-y-3">
                {patient.visits.slice(0, 5).map((visit) => (
                  <div key={visit.id} className="border-l-2 border-primary-500 pl-3">
                    <p className="text-sm font-medium text-gray-900">{visit.visitType}</p>
                    <p className="text-xs text-gray-600">
                      Dr. {visit.doctor?.name} - {formatDate(visit.scheduledAt)}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                      visit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      visit.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {visit.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDetail