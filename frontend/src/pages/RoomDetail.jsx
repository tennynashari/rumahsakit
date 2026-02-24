import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import roomService from '../services/roomService'
import { ArrowLeft, Edit, Trash2, Bed, DollarSign, Building, User } from 'lucide-react'
import toast from 'react-hot-toast'

const RoomDetail = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoom()
  }, [id])

  const fetchRoom = async () => {
    try {
      setLoading(true)
      const response = await roomService.getRoom(id)
      setRoom(response.data)
    } catch (error) {
      toast.error(t('rooms.loadFailed'))
      console.error('Fetch room error:', error)
      navigate('/rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(t('rooms.deleteConfirm'))) {
      try {
        await roomService.deleteRoom(id)
        toast.success(t('rooms.deleteSuccess'))
        navigate('/rooms')
      } catch (error) {
        const message = error.response?.data?.message || t('rooms.deleteFailed')
        toast.error(message)
      }
    }
  }

  const formatCurrency = (value) => {
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: i18n.language === 'id' ? 'IDR' : 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      OCCUPIED: 'bg-red-100 text-red-800',
      MAINTENANCE: 'bg-gray-100 text-gray-800',
      CLEANING: 'bg-blue-100 text-blue-800',
      RESERVED: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!room) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/rooms')}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{room.roomNumber}</h1>
            <p className="text-gray-600">{room.roomName || t('rooms.roomDetail')}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/rooms/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            {t('common.edit')}
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('common.delete')}
          </button>
        </div>
      </div>

      {/* Room Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">{t('rooms.overview')}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('rooms.roomNumber')}</p>
                <p className="font-medium text-gray-900">{room.roomNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('rooms.roomName')}</p>
                <p className="font-medium text-gray-900">{room.roomName || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('rooms.roomType')}</p>
                <p className="font-medium text-gray-900">{t(`rooms.types.${room.roomType}`)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('common.status')}</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                  {t(`rooms.status.${room.status}`)}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('rooms.floor')}</p>
                <p className="font-medium text-gray-900">{room.floor}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('rooms.building')}</p>
                <p className="font-medium text-gray-900">{room.building || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('rooms.bedCapacity')}</p>
                <p className="font-medium text-gray-900">{room.bedCapacity}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('rooms.currentOccupancy')}</p>
                <p className="font-medium text-gray-900">
                  {room.currentOccupancy || 0} / {room.bedCapacity}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('rooms.pricePerDay')}</p>
                <p className="font-medium text-gray-900">{formatCurrency(room.pricePerDay)}</p>
              </div>
            </div>

            {room.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">{t('rooms.description')}</p>
                <p className="mt-1 text-gray-900">{room.description}</p>
              </div>
            )}

            {room.facilities && room.facilities.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">{t('rooms.facilities')}</p>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map(facility => (
                    <span key={facility} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {t(`rooms.facilityOptions.${facility}`)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Patients */}
          {room.occupancies && room.occupancies.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">{t('rooms.currentPatients')}</h2>
              
              <div className="space-y-4">
                {room.occupancies.map(occupancy => (
                  <div key={occupancy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{occupancy.patient?.name}</p>
                        <p className="text-sm text-gray-600">
                          {occupancy.patient?.medicalRecordNumber}
                          {occupancy.bedNumber && ` • Bed ${occupancy.bedNumber}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{t('inpatients.doctor')}</p>
                      <p className="font-medium text-gray-900">{occupancy.doctor?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">{t('common.statistics')}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bed className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('rooms.availableBeds')}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {room.availableBeds || room.bedCapacity}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('rooms.pricePerDay')}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(room.pricePerDay)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('rooms.floor')}</p>
                  <p className="text-xl font-bold text-gray-900">{room.floor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDetail
