import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { billingService } from '../services'
import { CreditCard, Receipt, Download, Eye, Edit, Trash2, Plus, DollarSign, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Billing = () => {
  const { t, i18n } = useTranslation()
  const [billings, setBillings] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  })

  const fetchBillings = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10
      }
      
      const response = await billingService.getBillings(params)
      setBillings(response.data.billings)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error(t('billing.fetchFailed'))
      console.error('Fetch billings error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBillings(currentPage)
  }, [currentPage])

  const handleExport = async () => {
    try {
      if (!filters.startDate || !filters.endDate) {
        toast.error(t('billing.filters.dateRangeRequired'))
        return
      }

      toast.loading(t('billing.exporting'))
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate
      }
      const response = await billingService.exportBillings(params)
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Data_Tagihan_${filters.startDate}_sd_${filters.endDate}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success(t('billing.exportSuccess'))
    } catch (error) {
      toast.dismiss()
      toast.error(t('billing.exportFailed'))
      console.error('Export error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('billing.deleteConfirm'))) {
      try {
        await billingService.deleteBilling(id)
        toast.success(t('billing.deleteSuccess'))
        fetchBillings(currentPage)
      } catch (error) {
        toast.error(t('billing.deleteFailed'))
      }
    }
  }

  const handleMarkAsPaid = async (id) => {
    if (window.confirm(t('billing.markAsPaidConfirm'))) {
      try {
        await billingService.updateBilling(id, {
          status: 'PAID'
        })
        toast.success(t('billing.markAsPaidSuccess'))
        fetchBillings(currentPage)
      } catch (error) {
        toast.error(t('billing.markAsPaidFailed'))
        console.error('Mark as paid error:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { label: t('billing.status.paid'), className: 'bg-green-100 text-green-800' },
      UNPAID: { label: t('billing.status.unpaid'), className: 'bg-red-100 text-red-800' },
      PARTIALLY_PAID: { label: t('billing.status.partiallyPaid'), className: 'bg-yellow-100 text-yellow-800' },
      CANCELLED: { label: t('billing.status.cancelled'), className: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatCurrency = (value) => {
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    const currency = i18n.language === 'id' ? 'IDR' : 'USD'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value)
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('billing.title')}</h1>
          <p className="text-sm text-gray-600">{t('billing.subtitle')}</p>
        </div>
        <Link to="/billing/new" className="btn btn-primary text-sm w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{t('billing.addBilling')}</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('billing.filters.startDate')}
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
              {t('billing.filters.endDate')}
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
              {t('billing.filters.status')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input text-sm"
            >
              <option value="">{t('billing.filters.allStatus')}</option>
              <option value="PAID">{t('billing.status.paid')}</option>
              <option value="UNPAID">{t('billing.status.unpaid')}</option>
              <option value="PARTIALLY_PAID">{t('billing.status.partiallyPaid')}</option>
              <option value="CANCELLED">{t('billing.status.cancelled')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleExport}
              className="btn bg-green-600 hover:bg-green-700 text-white w-full text-sm"
              disabled={!filters.startDate || !filters.endDate}
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('common.exportExcel')}</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Billings Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('billing.loading')}</p>
          </div>
        ) : billings.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('billing.noData')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('billing.table.patient')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('billing.table.subtotal')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('billing.table.tax')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('billing.table.discount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('billing.table.total')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('billing.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('billing.table.date')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('billing.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billings.map((billing) => (
                    <tr key={billing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {billing.patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {billing.patient.medicalRecordNo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(billing.subtotal)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(billing.tax)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(billing.discount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(billing.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(billing.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(billing.createdAt)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(billing.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/billing/${billing.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title={t('common.viewDetail')}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {billing.status === 'UNPAID' && (
                            <button
                              onClick={() => handleMarkAsPaid(billing.id)}
                              className="text-green-600 hover:text-green-900"
                              title={t('billing.detail.markAsPaid')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to={`/billing/${billing.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(billing.id)}
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
              {billings.map((billing) => (
                <div key={billing.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(billing.status)}
                      </div>
                      <div className="font-medium text-gray-900 mb-1">{billing.patient.name}</div>
                      <div className="text-xs text-gray-500">MRN: {billing.patient.medicalRecordNo}</div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <Link
                        to={`/billing/${billing.id}`}
                        className="text-primary-600 hover:text-primary-900 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {billing.status === 'UNPAID' && (
                        <button
                          onClick={() => handleMarkAsPaid(billing.id)}
                          className="text-green-600 hover:text-green-900 p-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        to={`/billing/${billing.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(billing.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(billing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax:</span>
                      <span className="font-medium">{formatCurrency(billing.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount:</span>
                      <span className="font-medium">{formatCurrency(billing.discount)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-900 font-semibold">Total:</span>
                      <span className="text-gray-900 font-bold">{formatCurrency(billing.total)}</span>
                    </div>
                    <div className="text-xs text-gray-400 pt-1">
                      {formatDate(billing.createdAt)} • {formatTime(billing.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="hidden sm:inline">{t('billing.pagination.page')} </span>
                    <span className="font-medium">{currentPage}</span>
                    <span className="hidden sm:inline"> {t('billing.pagination.of')} </span>
                    <span className="sm:hidden">/</span>
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-secondary text-sm disabled:opacity-50"
                    >
                      <span className="hidden sm:inline">{t('billing.pagination.previous')}</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary text-sm disabled:opacity-50"
                    >
                      <span className="hidden sm:inline">{t('billing.pagination.next')}</span>
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

export default Billing