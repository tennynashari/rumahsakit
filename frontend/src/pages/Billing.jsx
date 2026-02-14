import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { billingService } from '../services'
import { CreditCard, Receipt, Download, Eye, Edit, Trash2, Plus, DollarSign, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Billing = () => {
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
      toast.error('Gagal memuat data tagihan')
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
        toast.error('Silakan pilih tanggal mulai dan tanggal akhir')
        return
      }

      toast.loading('Mengekspor data...')
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
      toast.success('Data berhasil diekspor')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mengekspor data')
      console.error('Export error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) {
      try {
        await billingService.deleteBilling(id)
        toast.success('Tagihan berhasil dihapus')
        fetchBillings(currentPage)
      } catch (error) {
        toast.error('Gagal menghapus tagihan')
      }
    }
  }

  const handleMarkAsPaid = async (id) => {
    if (window.confirm('Tandai tagihan ini sebagai lunas?')) {
      try {
        await billingService.updateBilling(id, {
          status: 'PAID'
        })
        toast.success('Tagihan berhasil ditandai lunas')
        fetchBillings(currentPage)
      } catch (error) {
        toast.error('Gagal mengubah status tagihan')
        console.error('Mark as paid error:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
      UNPAID: { label: 'Belum Bayar', className: 'bg-red-100 text-red-800' },
      PARTIALLY_PAID: { label: 'Dibayar Sebagian', className: 'bg-yellow-100 text-yellow-800' },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tagihan & Pembayaran</h1>
          <p className="text-sm text-gray-600">Kelola data tagihan dan pembayaran pasien</p>
        </div>
        <Link to="/billing/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tagihan
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
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
              Tanggal Akhir
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
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">Semua Status</option>
              <option value="PAID">Lunas</option>
              <option value="UNPAID">Belum Bayar</option>
              <option value="PARTIALLY_PAID">Dibayar Sebagian</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleExport}
              className="btn bg-green-600 hover:bg-green-700 text-white w-full"
              disabled={!filters.startDate || !filters.endDate}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Billings Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : billings.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada data tagihan</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pajak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diskon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
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
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {billing.status === 'UNPAID' && (
                            <button
                              onClick={() => handleMarkAsPaid(billing.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Tandai Lunas"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to={`/billing/${billing.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(billing.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
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

export default Billing