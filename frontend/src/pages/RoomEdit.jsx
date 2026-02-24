import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import roomService from '../services/roomService'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const RoomEdit = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomName: '',
    roomType: '',
    floor: '',
    building: '',
    bedCapacity: '1',
    pricePerDay: '',
    facilities: [],
    description: '',
    status: 'AVAILABLE'
  })

  const roomTypes = ['VIP', 'KELAS_1', 'KELAS_2', 'KELAS_3', 'ICU', 'NICU', 'PICU', 'ISOLATION']
  const roomStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING', 'RESERVED']
  const facilityOptions = ['AC', 'TV', 'BATHROOM', 'FRIDGE', 'WIFI', 'PHONE', 'SOFA', 'WARDROBE']

  useEffect(() => {
    fetchRoom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchRoom = async () => {
    try {
      setLoading(true)
      const response = await roomService.getRoom(id)
      console.log('Room data:', response.data)
      const room = response.data.room || response.data
      console.log('Room object:', room)
      setFormData({
        roomNumber: room.roomNumber || '',
        roomName: room.roomName || '',
        roomType: room.roomType || '',
        floor: room.floor?.toString() || '',
        building: room.building || '',
        bedCapacity: room.bedCapacity?.toString() || '1',
        pricePerDay: room.pricePerDay?.toString() || '',
        facilities: room.facilities || [],
        description: room.description || '',
        status: room.status || 'AVAILABLE'
      })
    } catch (error) {
      toast.error(t('rooms.loadFailed'))
      console.error('Fetch room error:', error)
      navigate('/rooms')
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

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      
      const submitData = {
        roomName: formData.roomName.trim() || null,
        roomType: formData.roomType,
        floor: parseInt(formData.floor),
        building: formData.building.trim() || null,
        bedCapacity: parseInt(formData.bedCapacity),
        pricePerDay: parseFloat(formData.pricePerDay),
        facilities: formData.facilities,
        description: formData.description.trim() || null,
        status: formData.status
      }

      await roomService.updateRoom(id, submitData)
      toast.success(t('rooms.updateSuccess'))
      navigate('/rooms')
    } catch (error) {
      toast.error(error.response?.data?.error || t('rooms.updateFailed'))
      console.error('Update room error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/rooms')}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('rooms.editRoom')}</h1>
          <p className="text-gray-600">{formData.roomNumber}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{t('rooms.overview')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Number - Readonly */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rooms.roomNumber')}
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                disabled
              />
            </div>

            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rooms.roomName')}
              </label>
              <input
                type="text"
                name="roomName"
                value={formData.roomName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={t('rooms.roomNamePlaceholder')}
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rooms.roomType')} <span className="text-red-500">*</span>
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                {roomTypes.map(type => (
                  <option key={type} value={type}>
                    {t(`rooms.types.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rooms.floor')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min="1"
                required
              />
            </div>

            {/* Building */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rooms.building')}
              </label>
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Bed Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rooms.bedCapacity')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="bedCapacity"
                value={formData.bedCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min="1"
                required
              />
            </div>

            {/* Price Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rooms.pricePerDay')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min="0"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.status')} <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                {roomStatuses.map(status => (
                  <option key={status} value={status}>
                    {t(`rooms.status.${status}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Facilities */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('rooms.facilities')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {facilityOptions.map(facility => (
                <label key={facility} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t(`rooms.facilityOptions.${facility}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('rooms.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows="3"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {submitting ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RoomEdit
