import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import roomService from '../services/roomService'
import { 
  Bed, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

const Rooms = () => {
  const { t, i18n } = useTranslation()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    roomType: '',
    floor: '',
    status: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const roomTypes = ['VIP', 'KELAS_1', 'KELAS_2', 'KELAS_3', 'ICU', 'NICU', 'PICU', 'ISOLATION']
  const roomStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING', 'RESERVED']

  const fetchRooms = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.roomType && { roomType: filters.roomType }),
        ...(filters.floor && { floor: parseInt(filters.floor) }),
        ...(filters.status && { status: filters.status })
      }
      
      const response = await roomService.getRooms(params)
      setRooms(response.data?.rooms || [])
      setTotalPages(response.data?.pagination?.pages || 1)
    } catch (error) {
      toast.error(t('rooms.loadFailed'))
      console.error('Fetch rooms error:', error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms(currentPage)
  }, [currentPage, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchRooms(1)
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('rooms.deleteConfirm'))) {
      try {
        await roomService.deleteRoom(id)
        toast.success(t('rooms.deleteSuccess'))
        fetchRooms(currentPage)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('rooms.title')}</h1>
          <p className="text-sm text-gray-600">{t('rooms.subtitle')}</p>
        </div>
        <Link
          to="/rooms/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('rooms.addRoom')}
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('rooms.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('common.search')}
          </button>
        </form>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('rooms.filterByType')}
            </label>
            <select
              value={filters.roomType}
              onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('rooms.allTypes')}</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {t(`rooms.types.${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('rooms.filterByFloor')}
            </label>
            <input
              type="number"
              placeholder={t('rooms.allFloors')}
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('rooms.filterByStatus')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('rooms.allStatuses')}</option>
              {roomStatuses.map((status) => (
                <option key={status} value={status}>
                  {t(`rooms.status.${status}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <div className="text-center py-12">
            <Bed className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">{t('rooms.noRoomsFound')}</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rooms.roomNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rooms.roomName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rooms.roomType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rooms.floor')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rooms.bedCapacity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rooms.pricePerDay')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.roomNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.roomName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t(`rooms.types.${room.roomType}`)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.floor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.currentOccupancy} / {room.bedCapacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(room.pricePerDay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(room.status)}`}>
                        {t(`rooms.status.${room.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/rooms/${room.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/rooms/${room.id}/edit`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('common.next')}
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {t('common.showing')} <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> {t('common.to')}{' '}
                      <span className="font-medium">{Math.min(currentPage * 10, rooms?.length || 0)}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {t('common.previous')}
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {t('common.next')}
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Rooms
