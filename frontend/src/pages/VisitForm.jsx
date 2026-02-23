import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { visitService, patientService, userService } from '../services'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const VisitForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    visitType: 'GENERAL_CHECKUP',
    scheduledAt: '',
    status: 'SCHEDULED',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsResponse, usersResponse] = await Promise.all([
        patientService.getPatients(),
        userService.getUsers()
      ])

      setPatients(patientsResponse.data.patients || [])
      
      // Filter doctors from users
      const usersList = usersResponse?.data?.users || usersResponse?.data || []
      const doctorsList = usersList.filter(user => user.role === 'DOCTOR')
      setDoctors(doctorsList)
    } catch (error) {
      console.error('Fetch data error:', error)
      toast.error(t('visitForm.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await visitService.createVisit(formData)
      toast.success(t('visitForm.createSuccess'))
      navigate('/visits')
    } catch (error) {
      toast.error(error.response?.data?.error || t('visitForm.createFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/visits')}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('visitForm.back')}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('visitForm.title')}</h1>
          <p className="text-gray-600">{t('visitForm.subtitle')}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t('visitForm.visitInfo')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('visitForm.patient')} <span className="text-red-500">*</span>
              </label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">{t('visitForm.patientPlaceholder')}</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.medicalRecordNo}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('visitForm.doctor')} <span className="text-red-500">*</span>
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">{t('visitForm.doctorPlaceholder')}</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('visitForm.visitType')} <span className="text-red-500">*</span>
              </label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="GENERAL_CHECKUP">{t('visitForm.visitTypes.GENERAL_CHECKUP')}</option>
                <option value="OUTPATIENT">{t('visitForm.visitTypes.OUTPATIENT')}</option>
                <option value="INPATIENT">{t('visitForm.visitTypes.INPATIENT')}</option>
                <option value="EMERGENCY">{t('visitForm.visitTypes.EMERGENCY')}</option>
              </select>
            </div>

            {/* Scheduled Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('visitForm.scheduledAt')} <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('visitForm.statusLabel')} <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="SCHEDULED">{t('visitForm.status.SCHEDULED')}</option>
                <option value="IN_PROGRESS">{t('visitForm.status.IN_PROGRESS')}</option>
                <option value="COMPLETED">{t('visitForm.status.COMPLETED')}</option>
                <option value="CANCELLED">{t('visitForm.status.CANCELLED')}</option>
                <option value="NO_SHOW">{t('visitForm.status.NO_SHOW')}</option>
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('visitForm.notes')}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="input"
                placeholder={t('visitForm.notesPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/visits')}
            className="btn btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('visitForm.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('visitForm.saveButton')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VisitForm
