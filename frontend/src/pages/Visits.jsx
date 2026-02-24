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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('visits.title')}</h1>
          <p className="text-sm text-gray-600">{t('visits.subtitle')}</p>
        </div>
        <Link to="/visits/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          {t('visits.addVisit')}
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('visits.filters.startDate')}
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
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
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('visits.filters.status')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
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
              className="btn bg-green-600 hover:bg-green-700 text-white w-full"
              disabled={!filters.startDate || !filters.endDate}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('visits.exportData')}
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
            <div className="overflow-x-auto">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Halaman <span className="font-medium">{currentPage}</span> dari{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="btn btn-secondary"
                        >
                          Sebelumnya
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="btn btn-secondary ml-3"
                        >
                          Selanjutnya
                        </button>
                      </nav>
                    </div>
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