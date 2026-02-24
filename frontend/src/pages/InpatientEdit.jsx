import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { inpatientService, roomService } from '../services'
import { ArrowLeft, Save, Bed, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const InpatientEdit = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [occupancy, setOccupancy] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  
  const [formData, setFormData] = useState({
    roomId: '',
    bedNumber: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [occupancyResponse, roomsResponse] = await Promise.all([
        inpatientService.getInpatient(id),
        roomService.getRooms({ status: 'AVAILABLE' })
      ])

      const occ = occupancyResponse.data?.occupancy || occupancyResponse.data
      setOccupancy(occ)
      
      // Include current room in available rooms
      const availableRooms = roomsResponse.data?.rooms || []
      if (occ.room && !availableRooms.find(r => r.id === occ.room.id)) {
        availableRooms.unshift(occ.room)
      }
      setRooms(availableRooms)

      setFormData({
        roomId: occ.room?.id?.toString() || '',
        bedNumber: occ.bedNumber?.toString() || '',
        notes: occ.notes || ''
      })

      setSelectedRoom(occ.room)
    } catch (error) {
      toast.error(t('inpatients.loadFailed'))
      console.error('Fetch data error:', error)
      navigate('/inpatients')
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

    // When room changes, update selected room
    if (name === 'roomId') {
      const room = rooms.find(r => r.id === parseInt(value))
      setSelectedRoom(room)
      // Reset bed number if changing rooms
      if (room?.id !== occupancy?.room?.id) {
        setFormData(prev => ({ ...prev, bedNumber: '' }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.roomId) {
      toast.error(t('inpatients.selectRoom'))
      return
    }

    try {
      setSubmitting(true)
      
      const updateData = {
        newRoomId: parseInt(formData.roomId),
        newBedNumber: formData.bedNumber ? parseInt(formData.bedNumber) : undefined,
        notes: formData.notes || undefined
      }

      await inpatientService.updateOccupancy(id, updateData)
      toast.success(t('inpatients.updateSuccess'))
      navigate(`/inpatients/${id}`)
    } catch (error) {
      toast.error(error.response?.data?.error || t('inpatients.updateFailed'))
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

  if (!occupancy || occupancy.status !== 'ACTIVE') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600">{t('inpatients.cannotEdit')}</p>
        <button
          onClick={() => navigate('/inpatients')}
          className="mt-4 btn-primary"
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  const isRoomChanged = formData.roomId !== occupancy.room?.id?.toString()
  const currentRoomPrice = occupancy.room?.pricePerDay || 0
  const newRoomPrice = selectedRoom?.pricePerDay || 0
  const priceDifference = newRoomPrice - currentRoomPrice

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/inpatients/${id}`)}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inpatients.editOccupancy')}</h1>
          <p className="text-gray-600">{occupancy.registrationNumber}</p>
        </div>
      </div>

      {/* Current Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">{t('inpatients.currentInfo')}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">{t('inpatients.patient')}</p>
            <p className="font-medium">{occupancy.patient?.name}</p>
            <p className="text-gray-500">{occupancy.patient?.medicalRecordNo}</p>
          </div>
          <div>
            <p className="text-gray-600">{t('inpatients.currentRoom')}</p>
            <p className="font-medium">
              {occupancy.room?.roomNumber} - {t(`rooms.types.${occupancy.room?.roomType}`)}
            </p>
            <p className="text-gray-500">
              Bed {occupancy.bedNumber || '-'} | Floor {occupancy.room?.floor}
            </p>
          </div>
          <div>
            <p className="text-gray-600">{t('inpatients.doctor')}</p>
            <p className="font-medium">{occupancy.doctor?.name}</p>
            <p className="text-gray-500">{occupancy.doctor?.department}</p>
          </div>
          <div>
            <p className="text-gray-600">{t('inpatients.lengthOfStay')}</p>
            <p className="font-medium">{occupancy.currentDays || 1} {t('inpatients.days')}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Bed className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">{t('inpatients.changeRoom')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.newRoom')} <span className="text-red-500">*</span>
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
                    {room.id === occupancy.room?.id ? ` (${t('inpatients.current')})` : ''}
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
                placeholder={t('inpatients.reasonForChange')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Price Comparison */}
            {isRoomChanged && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  {t('inpatients.priceComparison')}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">{t('inpatients.currentPrice')}</span>
                    <span className="font-medium">Rp {currentRoomPrice.toLocaleString('id-ID')}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">{t('inpatients.newPrice')}</span>
                    <span className="font-medium">Rp {newRoomPrice.toLocaleString('id-ID')}/day</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-1">
                    <span className="font-medium text-blue-900">{t('inpatients.difference')}</span>
                    <span className={`font-bold ${priceDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {priceDifference > 0 ? '+' : ''}Rp {priceDifference.toLocaleString('id-ID')}/day
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/inpatients/${id}`)}
            className="btn-secondary"
            disabled={submitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || !isRoomChanged}
            className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('inpatients.saveChanges')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default InpatientEdit
