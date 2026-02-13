import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { recordService } from '../services'
import { FileText, Download, Eye, Edit, Trash2, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const Records = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  })

  const fetchRecords = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10
      }
      
      const response = await recordService.getRecords(params)
      setRecords(response.data.records)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error('Gagal memuat data rekam medis')
      console.error('Fetch records error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords(currentPage)
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
      const response = await recordService.exportRecords(params)
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Rekam_Medis_${filters.startDate}_sd_${filters.endDate}.xlsx`
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
    if (window.confirm('Apakah Anda yakin ingin menghapus rekam medis ini?')) {
      try {
        await recordService.deleteRecord(id)
        toast.success('Rekam medis berhasil dihapus')
        fetchRecords(currentPage)
      } catch (error) {
        toast.error('Gagal menghapus rekam medis')
      }
    }
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
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
          <h1 className="text-2xl font-bold text-gray-900">Rekam Medis</h1>
          <p className="text-sm text-gray-600">Kelola data rekam medis elektronik pasien</p>
        </div>
        <Link to="/records/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rekam Medis
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Records Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada data rekam medis</p>
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
                      Dokter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keluhan
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
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.patient.medicalRecordNo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {calculateAge(record.patient.dateOfBirth)} tahun • {record.patient.gender === 'MALE' ? 'L' : 'P'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.doctor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.doctor.department}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {record.diagnosisCode && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                              {record.diagnosisCode}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-900 mt-1">
                          {record.diagnosis || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.symptoms || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(record.createdAt)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(record.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/records/${record.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/records/${record.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(record.id)}
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

export default Records

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Records</h3>
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent medical records</p>
          <p className="text-sm text-yellow-600 mt-4">
            🚧 <strong>Coming Soon:</strong> Comprehensive EMR features including SOAP notes, 
            diagnosis coding (ICD-10), prescription management, and medical history tracking.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Records