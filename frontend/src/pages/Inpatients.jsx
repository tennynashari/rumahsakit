import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import inpatientService from '../services/inpatientService'
import CheckOutModal from '../components/CheckOutModal'
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  LogOut,
  Eye,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const Inpatients = () => {
  const { t, i18n } = useTranslation()
  const [inpatients, setInpatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    roomType: '',
    floor: '',
    doctorId: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [selectedOccupancy, setSelectedOccupancy] = useState(null)

  const roomTypes = ['VIP', 'KELAS_1', 'KELAS_2', 'KELAS_3', 'ICU', 'NICU', 'PICU', 'ISOLATION']

  const fetchInpatients = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.roomType && { roomType: filters.roomType }),
        ...(filters.floor && { floor: parseInt(filters.floor) }),
        ...(filters.doctorId && { doctorId: filters.doctorId })
      }
      
      const response = await inpatientService.getInpatients(params)
      setInpatients(response.data?.inpatients || [])
      setTotalPages(response.data?.pagination?.pages || 1)
    } catch (error) {
      toast.error(t('inpatients.loadFailed'))
      console.error('Fetch inpatients error:', error)
      setInpatients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInpatients(currentPage)
  }, [currentPage, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchInpatients(1)
  }

  const openCheckoutModal = (occupancy) => {
    setSelectedOccupancy(occupancy)
    setCheckoutModalOpen(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const formatCurrency = (value) => {
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: i18n.language === 'id' ? 'IDR' : 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('inpatients.title')}</h1>
          <p className="text-sm text-gray-600">{t('inpatients.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            to="/inpatients/history"
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            <Calendar className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
            {t('inpatients.history')}
          </Link>
          <Link
            to="/inpatients/check-in"
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
            {t('inpatients.checkIn')}
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('inpatients.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm w-full sm:w-auto"
          >
            {t('common.search')}
          </button>
        </form>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('rooms.filterByType')}
            </label>
            <select
              value={filters.roomType}
              onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Inpatients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : !inpatients || inpatients.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">{t('common.noDataFound')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inpatients.medicalRecordNo')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inpatients.patientName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inpatients.roomNumber')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inpatients.doctor')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inpatients.checkInDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inpatients.lengthOfStay')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inpatients.map((occupancy) => (
                    <tr key={occupancy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {occupancy.patient?.medicalRecordNo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {occupancy.patient?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {occupancy.room?.roomNumber || '-'}
                        {occupancy.bedNumber && ` - Bed ${occupancy.bedNumber}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {occupancy.doctor?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(occupancy.checkedInAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {occupancy.currentDays} {t('inpatients.days')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/inpatients/${occupancy.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/inpatients/${occupancy.id}/edit`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => openCheckoutModal(occupancy)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <LogOut className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {inpatients.map((occupancy) => (
                <div key={occupancy.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{occupancy.patient?.name || '-'}</div>
                      <div className="text-xs text-gray-500">MRN: {occupancy.patient?.medicalRecordNo || '-'}</div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <Link
                        to={`/inpatients/${occupancy.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/inpatients/${occupancy.id}/edit`}
                        className="text-primary-600 hover:text-primary-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openCheckoutModal(occupancy)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Room:</span>
                      <span className="ml-1 font-medium">
                        {occupancy.room?.roomNumber || '-'}
                        {occupancy.bedNumber && ` - Bed ${occupancy.bedNumber}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Doctor:</span>
                      <span className="ml-1 font-medium">{occupancy.doctor?.name || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Check-in:</span>
                      <span className="ml-1 font-medium">{formatDate(occupancy.checkedInAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stay:</span>
                      <span className="ml-1 font-medium">{occupancy.currentDays} {t('inpatients.days')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                      <span className="font-medium">{Math.min(currentPage * 10, inpatients?.length || 0)}</span>
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

      {/* Checkout Modal */}
      <CheckOutModal
        occupancy={selectedOccupancy}
        isOpen={checkoutModalOpen}
        onClose={() => {
          setCheckoutModalOpen(false)
          setSelectedOccupancy(null)
        }}
        onSuccess={() => {
          fetchInpatients(currentPage)
        }}
      />
    </div>
  )
}

export default Inpatients
