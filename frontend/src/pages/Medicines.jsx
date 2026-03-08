import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { medicineService } from '../services'
import { Pill, Package, Download, Eye, Edit, Trash2, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const Medicines = () => {
  const { t, i18n } = useTranslation()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchMedicines = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...(search && { search })
      }
      
      const response = await medicineService.getMedicines(params)
      setMedicines(response.data.medicines)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error(t('medicines.fetchFailed'))
      console.error('Fetch medicines error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines(currentPage, searchTerm)
  }, [currentPage])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchMedicines(1, searchTerm)
  }

  const handleExport = async () => {
    try {
      toast.loading(t('medicines.exporting'))
      const response = await medicineService.exportMedicines()
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Data_Obat_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success(t('medicines.exportSuccess'))
    } catch (error) {
      toast.dismiss()
      toast.error(t('medicines.exportFailed'))
      console.error('Export error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('medicines.deleteConfirm'))) {
      try {
        await medicineService.deleteMedicine(id)
        toast.success(t('medicines.deleteSuccess'))
        fetchMedicines(currentPage, searchTerm)
      } catch (error) {
        toast.error(t('medicines.deleteFailed'))
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('medicines.title')}</h1>
          <p className="text-sm text-gray-600">{t('medicines.subtitle')}</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button 
            onClick={handleExport}
            className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <Download className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('medicines.exportData')}</span>
            <span className="sm:hidden">Export</span>
          </button>
          <Link to="/medicines/new" className="btn btn-primary text-sm">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('medicines.addMedicine')}</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('medicines.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 text-sm"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary text-sm w-full sm:w-auto">
            {t('medicines.searchButton')}
          </button>
        </form>
      </div>

      {/* Medicines Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                      {t('medicines.table.medicineName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('medicines.table.description')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('medicines.table.unit')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('medicines.table.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('medicines.table.stock')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('medicines.table.status')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('medicines.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicines.map((medicine) => (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Pill className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {medicine.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {medicine.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {medicine.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(medicine.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {medicine.totalStock || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {medicine.isActive ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {t('medicines.table.active')}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            {t('medicines.table.inactive')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/medicines/${medicine.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title={t('common.view')}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/medicines/${medicine.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(medicine.id)}
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
              {medicines.map((medicine) => (
                <div key={medicine.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start flex-1">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900 mb-1">{medicine.name}</div>
                        {medicine.description && (
                          <div className="text-xs text-gray-500 line-clamp-2">{medicine.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <Link
                        to={`/medicines/${medicine.id}`}
                        className="text-primary-600 hover:text-primary-900 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/medicines/${medicine.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Unit:</span>
                      <span className="ml-1 font-medium">{medicine.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="ml-1 font-medium">{formatCurrency(medicine.price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <span className="ml-1 font-medium">{medicine.totalStock || 0}</span>
                    </div>
                    <div>
                      {medicine.isActive ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {t('medicines.table.active')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          {t('medicines.table.inactive')}
                        </span>
                      )}
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

export default Medicines