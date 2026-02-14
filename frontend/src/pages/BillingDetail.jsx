import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { billingService } from '../services'
import { ArrowLeft, Edit, Printer, Calendar, User, FileText, DollarSign, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const BillingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [billing, setBilling] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBilling()
  }, [id])

  const fetchBilling = async () => {
    try {
      setLoading(true)
      const response = await billingService.getBilling(id)
      setBilling(response.data.billing)
    } catch (error) {
      console.error('Fetch billing error:', error)
      toast.error('Gagal memuat data billing')
      navigate('/billing')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      PAID: 'bg-green-100 text-green-800',
      UNPAID: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      PAID: 'Sudah Dibayar',
      UNPAID: 'Belum Dibayar',
      CANCELLED: 'Dibatalkan'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badges[status] || badges.UNPAID}`}>
        {labels[status] || status}
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleMarkAsPaid = async () => {
    if (window.confirm('Tandai tagihan ini sebagai lunas?')) {
      try {
        await billingService.updateBilling(id, {
          status: 'PAID'
        })
        toast.success('Tagihan berhasil ditandai lunas')
        // Refresh billing data
        fetchBilling()
      } catch (error) {
        toast.error('Gagal mengubah status tagihan')
        console.error('Mark as paid error:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!billing) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Billing tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/billing')}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Billing</h1>
            <p className="text-gray-600">Invoice #{billing.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn bg-gray-600 text-white hover:bg-gray-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </button>
          {billing.status === 'UNPAID' && (
            <button
              onClick={handleMarkAsPaid}
              className="btn bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Tandai Lunas
            </button>
          )}
          <Link
            to={`/billing/${id}/edit`}
            className="btn btn-primary"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 print:shadow-none print:border-0">
        {/* Invoice Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
              <p className="text-gray-600">#{billing.id.toString().padStart(6, '0')}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">Hospital Information System</p>
              <p className="text-gray-600 mt-1">Sistem Informasi Rumah Sakit</p>
            </div>
          </div>
        </div>

        {/* Patient & Billing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Informasi Pasien</h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-semibold text-gray-900">{billing.patient.name}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">No. Rekam Medis</p>
                  <p className="font-semibold text-gray-900">{billing.patient.medicalRecordNo}</p>
                </div>
              </div>
              {billing.patient.phone && (
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-semibold text-gray-900">{billing.patient.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Informasi Billing</h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Dibuat</p>
                  <p className="font-semibold text-gray-900">{formatDate(billing.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Status Pembayaran</p>
                  <div className="mt-1">{getStatusBadge(billing.status)}</div>
                </div>
              </div>
              {billing.paidAt && (
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Dibayar</p>
                    <p className="font-semibold text-gray-900">{formatDate(billing.paidAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Billing Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rincian Tagihan</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Deskripsi</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(billing.items) && billing.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">{item.description}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {formatCurrency(parseFloat(item.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-300 pt-6">
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(parseFloat(billing.subtotal))}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Pajak</span>
                <span className="font-medium">{formatCurrency(parseFloat(billing.tax))}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Diskon</span>
                <span className="font-medium text-red-600">- {formatCurrency(parseFloat(billing.discount))}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-3">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(parseFloat(billing.total))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-600 print:block hidden">
          <p>Terima kasih atas kepercayaan Anda</p>
          <p className="mt-1">Invoice ini dibuat secara otomatis oleh sistem</p>
        </div>
      </div>
    </div>
  )
}

export default BillingDetail
