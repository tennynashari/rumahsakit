import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { billingService, patientService, visitService } from '../services'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const BillingForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [patients, setPatients] = useState([])
  const [visits, setVisits] = useState([])
  const [formData, setFormData] = useState({
    patientId: '',
    visitId: '',
    items: [
      { description: '', amount: '' }
    ],
    tax: '10',
    discount: '0'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsResponse, visitsResponse] = await Promise.all([
        patientService.getPatients(),
        visitService.getVisits({ limit: 1000 })
      ])

      setPatients(patientsResponse.data.patients || [])
      setVisits(visitsResponse.data.visits || [])
    } catch (error) {
      console.error('Fetch data error:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePatientChange = (e) => {
    const patientId = parseInt(e.target.value)
    setFormData(prev => ({
      ...prev,
      patientId: patientId,
      visitId: '' // Reset visit when patient changes
    }))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: '' }]
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        items: newItems
      }))
    }
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0
      return sum + amount
    }, 0)

    const taxPercent = parseFloat(formData.tax) || 0
    const tax = (subtotal * taxPercent) / 100

    const discount = parseFloat(formData.discount) || 0
    const total = subtotal + tax - discount

    return { subtotal, tax, discount, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)

      // Validate items
      const validItems = formData.items.every(item => 
        item.description.trim() && item.amount && parseFloat(item.amount) > 0
      )

      if (!validItems) {
        toast.error('Semua item harus diisi dengan benar')
        return
      }

      const { subtotal, tax, discount, total } = calculateTotals()

      const submitData = {
        patientId: parseInt(formData.patientId),
        visitId: formData.visitId ? parseInt(formData.visitId) : null,
        items: formData.items.map(item => ({
          description: item.description.trim(),
          amount: parseFloat(item.amount)
        })),
        subtotal,
        tax,
        discount,
        total
      }

      await billingService.createBilling(submitData)
      toast.success('Billing berhasil dibuat')
      navigate('/billing')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal membuat billing')
      console.error('Create billing error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter visits by selected patient
  const filteredVisits = formData.patientId 
    ? visits.filter(v => v.patientId === formData.patientId)
    : visits

  const { subtotal, tax, discount, total } = calculateTotals()

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/billing')}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Billing</h1>
          <p className="text-gray-600">Buat tagihan baru untuk pasien</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informasi Pasien</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasien <span className="text-red-500">*</span>
              </label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handlePatientChange}
                className="input"
                required
              >
                <option value="">Pilih Pasien</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.medicalRecordNo}
                  </option>
                ))}
              </select>
            </div>

            {/* Visit (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kunjungan (Opsional)
              </label>
              <select
                name="visitId"
                value={formData.visitId}
                onChange={handleChange}
                className="input"
                disabled={!formData.patientId}
              >
                <option value="">Tanpa Kunjungan</option>
                {filteredVisits.map(visit => (
                  <option key={visit.id} value={visit.id}>
                    {new Date(visit.scheduledAt).toLocaleDateString('id-ID')} - {visit.visitType}
                  </option>
                ))}
              </select>
              {!formData.patientId && (
                <p className="text-sm text-gray-500 mt-1">Pilih pasien terlebih dahulu</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Item Billing</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn btn-sm bg-primary-600 text-white hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah Item
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="input"
                    placeholder="Deskripsi (misal: Konsultasi Dokter, Obat, dll)"
                    required
                  />
                </div>
                <div className="w-48">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="input"
                    placeholder="Jumlah (Rp)"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn btn-sm bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Perhitungan</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pajak (%)
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diskon (Rp)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pajak ({formData.tax}%):</span>
                <span className="font-medium">Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diskon:</span>
                <span className="font-medium text-red-600">- Rp {discount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/billing')}
            className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BillingForm
