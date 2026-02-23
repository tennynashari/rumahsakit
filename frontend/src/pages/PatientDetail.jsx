import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { patientService } from '../services'
import { ArrowLeft, Edit, User, Phone, Mail, MapPin, Heart, Calendar, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const PatientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatientDetail()
  }, [id])

  const fetchPatientDetail = async () => {
    try {
      setLoading(true)
      const response = await patientService.getPatient(id)
      setPatient(response.data.patient)
    } catch (error) {
      toast.error(t('patients.detail.fetchFailed'))
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
    return null
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
            {t('patients.form.back')}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-sm text-gray-600">
              {t('patients.detail.medicalRecordNo')}: {patient.medicalRecordNo}
            </p>
          </div>
        </div>
        <Link
          to={`/patients/${id}/edit`}
          className="btn btn-primary"
        >
          <Edit className="w-4 h-4 mr-2" />
          {t('common.edit')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('patients.detail.personalInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t('patients.form.fullName')}</p>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t('patients.detail.dateOfBirth')}</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(patient.dateOfBirth)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {calculateAge(patient.dateOfBirth)} {t('patients.detail.yearsOld')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t('patients.detail.gender')}</p>
                  <p className="font-medium text-gray-900">
                    {t(`patients.gender.${patient.gender.toLowerCase()}`)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Heart className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t('patients.detail.bloodType')}</p>
                  <p className="font-medium text-gray-900">
                    {emergencyContact.bloodType || t('patients.detail.notSpecified')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('patients.detail.contactInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t('patients.detail.phone')}</p>
                  <p className="font-medium text-gray-900">
                    {patient.phone || t('patients.detail.notSpecified')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t('patients.detail.email')}</p>
                  <p className="font-medium text-gray-900">
                    {emergencyContact.email || t('patients.detail.notSpecified')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t('patients.detail.address')}</p>
                  <p className="font-medium text-gray-900">
                    {patient.address || t('patients.detail.notSpecified')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('patients.detail.medicalInfo')}
            </h2>
            <div>
              <p className="text-sm text-gray-600 mb-2">{t('patients.detail.allergies')}</p>
              <p className="font-medium text-gray-900">
                {emergencyContact.allergies || t('patients.detail.notSpecified')}
              </p>
            </div>
          </div>

          {/* Recent Visits */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('patients.detail.recentVisits')}
              </h2>
              <Link
                to={`/visits?patient=${id}`}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                {t('patients.detail.viewAll')}
              </Link>
            </div>
            
            {patient.visits && patient.visits.length > 0 ? (
              <div className="space-y-3">
                {patient.visits.slice(0, 5).map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {visit.visitType}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t('patients.detail.visitDoctor')}: {visit.doctor?.name || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {formatDate(visit.scheduledAt)}
                      </p>
                      <span className={`badge ${
                        visit.status === 'COMPLETED' ? 'badge-success' :
                        visit.status === 'IN_PROGRESS' ? 'badge-warning' :
                        visit.status === 'SCHEDULED' ? 'badge-primary' :
                        'badge-gray'
                      }`}>
                        {visit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {t('patients.detail.noVisits')}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Emergency */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <div className="card bg-red-50 border-red-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('patients.detail.emergencyContact')}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">{t('patients.detail.name')}</p>
                <p className="font-medium text-gray-900">
                  {emergencyContact.name || t('patients.detail.notSpecified')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('patients.detail.phone')}</p>
                <p className="font-medium text-gray-900">
                  {emergencyContact.phone || t('patients.detail.notSpecified')}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('patients.detail.statistics')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t('patients.detail.totalVisits')}
                </span>
                <span className="font-semibold text-gray-900">
                  {patient._count?.visits || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t('patients.detail.lastVisit')}
                </span>
                <span className="font-semibold text-gray-900">
                  {patient.visits && patient.visits.length > 0
                    ? formatDate(patient.visits[0].scheduledAt)
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDetail