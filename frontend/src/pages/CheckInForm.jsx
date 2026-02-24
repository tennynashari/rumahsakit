import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { inpatientService, patientService, userService, roomService } from '../services'
import { ArrowLeft, Save, User, Bed, Calendar, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const CheckInForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  
  const [formData, setFormData] = useState({
    patientId: '',
    roomId: '',
    bedNumber: '',
    doctorId: '',
    initialDiagnosis: '',
    estimatedCheckoutAt: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsResponse, usersResponse, roomsResponse] = await Promise.all([
        patientService.getPatients(),
        userService.getUsers(),
        roomService.getRooms({ status: 'AVAILABLE' })
      ])

      setPatients(patientsResponse.data?.patients || [])
      
      // Filter doctors from users
      const usersList = usersResponse?.data?.users || usersResponse?.data || []
      const doctorsList = usersList.filter(user => user.role === 'DOCTOR')
      setDoctors(doctorsList)

      setRooms(roomsResponse.data?.rooms || [])
    } catch (error) {
      console.error('Fetch data error:', error)
      toast.error(t('inpatients.loadFailed'))
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

    // When room changes, update selected room for bed capacity info
    if (name === 'roomId') {
      const room = rooms.find(r => r.id === parseInt(value))
      setSelectedRoom(room)
      // Reset bed number when room changes
      setFormData(prev => ({ ...prev, bedNumber: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.patientId) {
      toast.error(t('inpatients.selectPatient'))
      return
    }
    if (!formData.roomId) {
      toast.error(t('inpatients.selectRoom'))
      return
    }
    if (!formData.doctorId) {
      toast.error(t('inpatients.selectDoctor'))
      return
    }
    if (!formData.initialDiagnosis) {
      toast.error(t('inpatients.enterDiagnosis'))
      return
    }

    try {
      setSubmitting(true)
      
      // Convert to proper types
      const checkInData = {
        patientId: parseInt(formData.patientId),
        roomId: parseInt(formData.roomId),
        bedNumber: formData.bedNumber ? parseInt(formData.bedNumber) : undefined,
        doctorId: parseInt(formData.doctorId),
        initialDiagnosis: formData.initialDiagnosis,
        estimatedCheckoutAt: formData.estimatedCheckoutAt || undefined,
        notes: formData.notes || undefined
      }

      await inpatientService.checkInPatient(checkInData)
      toast.success(t('inpatients.checkInSuccess'))
      navigate('/inpatients')
    } catch (error) {
      toast.error(error.response?.data?.error || t('inpatients.checkInFailed'))
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
          onClick={() => navigate('/inpatients')}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inpatients.checkIn')}</h1>
          <p className="text-gray-600">{t('inpatients.checkInSubtitle')}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">{t('inpatients.patientInfo')}</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.patient')} <span className="text-red-500">*</span>
              </label>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t('common.select')}</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.medicalRecordNo} - {patient.name} ({patient.gender === 'MALE' ? t('patients.male') : t('patients.female')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Room Information */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Bed className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">{t('inpatients.roomInfo')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                {t('rooms.room')} <span className="text-red-500">*</span>
              </label>
              <select
                id="roomId"
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t('common.select')}</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} - {room.roomName} ({t(`rooms.types.${room.roomType}`)}) - Floor {room.floor}
                  </option>
                ))}
              </select>
              {selectedRoom && (
                <p className="mt-1 text-sm text-gray-500">
                  {t('rooms.bedCapacity')}: {selectedRoom.bedCapacity} | 
                  {t('rooms.available')}: {selectedRoom.availableBeds || selectedRoom.bedCapacity} | 
                  Rp {selectedRoom.pricePerDay?.toLocaleString('id-ID')}/day
                </p>
              )}
            </div>

            <div>
              <label htmlFor="bedNumber" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.bedNumber')}
              </label>
              <input
                type="number"
                id="bedNumber"
                name="bedNumber"
                value={formData.bedNumber}
                onChange={handleChange}
                min="1"
                max={selectedRoom?.bedCapacity || 99}
                placeholder={selectedRoom ? `1-${selectedRoom.bedCapacity}` : ''}
                disabled={!formData.roomId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                {t('inpatients.bedNumberHint')}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">{t('inpatients.medicalInfo')}</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.doctor')} <span className="text-red-500">*</span>
              </label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t('common.select')}</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="initialDiagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.initialDiagnosis')} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="initialDiagnosis"
                name="initialDiagnosis"
                value={formData.initialDiagnosis}
                onChange={handleChange}
                required
                rows="3"
                placeholder={t('inpatients.initialDiagnosisPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">{t('inpatients.scheduleInfo')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimatedCheckoutAt" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.estimatedCheckout')}
              </label>
              <input
                type="datetime-local"
                id="estimatedCheckoutAt"
                name="estimatedCheckoutAt"
                value={formData.estimatedCheckoutAt}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.notes')}
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder={t('inpatients.notesPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/inpatients')}
            className="btn-secondary"
            disabled={submitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary inline-flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('inpatients.checkInPatient')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CheckInForm
