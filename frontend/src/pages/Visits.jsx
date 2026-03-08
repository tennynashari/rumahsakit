import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { visitService } from '../services'
import { Calendar, Clock, User, Search, Download, Filter, Eye, Edit, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const Visits = () => {
  const { t, i18n } = useTranslation()
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  })

  const fetchVisits = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10
      }
      
      const response = await visitService.getVisits(params)
      setVisits(response.data.visits)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error(t('visits.fetchFailed'))
      console.error('Fetch visits error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisits(currentPage)
  }, [currentPage])

  const handleExport = async () => {
    try {
      if (!filters.startDate || !filters.endDate) {
        toast.error(t('visits.selectDateRange'))
        return
      }

      toast.loading(t('visits.exporting'))
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate
      }
      const response = await visitService.exportVisits(params)
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Data_Kunjungan_${filters.startDate}_sd_${filters.endDate}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success(t('visits.exportSuccess'))
    } catch (error) {
      toast.dismiss()
      toast.error(t('visits.exportFailed'))
      console.error('Export error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('visits.deleteConfirm'))) {
      try {
        await visitService.deleteVisit(id)
        toast.success(t('visits.deleteSuccess'))
        fetchVisits(currentPage)
      } catch (error) {
        toast.error(t('visits.deleteFailed'))
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: { label: t('visits.status.scheduled'), className: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: t('visits.status.inProgress'), className: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: t('visits.status.completed'), className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: t('visits.status.cancelled'), className: 'bg-red-100 text-red-800' },
      NO_SHOW: { label: t('visits.status.noShow'), className: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getVisitTypeBadge = (type) => {
    const typeConfig = {
      GENERAL_CHECKUP: { label: t('visits.visitType.generalCheckup'), className: 'bg-green-100 text-green-800' },
      OUTPATIENT: { label: t('visits.visitType.outpatient'), className: 'bg-blue-100 text-blue-800' },
      INPATIENT: { label: t('visits.visitType.inpatient'), className: 'bg-purple-100 text-purple-800' },
      EMERGENCY: { label: t('visits.visitType.emergency'), className: 'bg-red-100 text-red-800' },
      MEDICAL_ACTION: { label: t('visits.visitType.medicalAction'), className: 'bg-orange-100 text-orange-800' }
    }

    const config = typeConfig[type] || { label: type, className: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('visits.title')}</h1>
          <p className="text-sm text-gray-600">{t('visits.subtitle')}</p>
        </div>
        <Link to="/visits/new" className="btn btn-primary text-sm w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          {t('visits.addVisit')}
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('visits.filters.startDate')}
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('visits.filters.endDate')}
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('visits.filters.status')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input text-sm"
            >
              <option value="">{t('visits.filters.allStatuses')}</option>
              <option value="SCHEDULED">{t('visits.status.scheduled')}</option>
              <option value="IN_PROGRESS">{t('visits.status.inProgress')}</option>
              <option value="COMPLETED">{t('visits.status.completed')}</option>
              <option value="CANCELLED">{t('visits.status.cancelled')}</option>
              <option value="NO_SHOW">{t('visits.status.noShow')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleExport}
              className="btn bg-green-600 hover:bg-green-700 text-white w-full text-sm"
              disabled={!filters.startDate || !filters.endDate}
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('visits.exportData')}</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('common.noData')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('visits.detail.queueNumber')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('visits.table.patientName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('visits.table.doctorName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('visits.table.visitType')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('visits.table.scheduledAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('visits.table.status')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('visits.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {visit.queueNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {visit.patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {visit.patient.medicalRecordNo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {visit.doctor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {visit.doctor.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVisitTypeBadge(visit.visitType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(visit.scheduledAt)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(visit.scheduledAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(visit.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/visits/${visit.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title={t('common.view')}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/visits/${visit.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            className="text-red-600 hover:text-red-900"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
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
              {visits.map((visit) => (
                <div key={visit.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(visit.status)}
                        {getVisitTypeBadge(visit.visitType)}
                      </div>
                      <div className="font-medium text-gray-900 mb-1">
                        {visit.patient.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        MRN: {visit.patient.medicalRecordNo}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/visits/${visit.id}`}
                        className="text-primary-600 hover:text-primary-900 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/visits/${visit.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(visit.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">{visit.doctor.name}</div>
                        <div className="text-xs text-gray-500">{visit.doctor.department}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(visit.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{formatTime(visit.scheduledAt)}</span>
                    </div>
                    {visit.queueNumber && (
                      <div className="text-xs text-gray-500">
                        Queue: #{visit.queueNumber}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="hidden sm:inline">Halaman </span>
                    <span className="font-medium">{currentPage}</span>
                    <span className="hidden sm:inline"> dari </span>
                    <span className="sm:hidden">/</span>
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-secondary text-sm disabled:opacity-50"
                    >
                      <span className="hidden sm:inline">Sebelumnya</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary text-sm disabled:opacity-50"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <span className="sm:hidden">Next</span>
                    </button>
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

export default Visits