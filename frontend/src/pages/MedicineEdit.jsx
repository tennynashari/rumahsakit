import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { medicineService } from '../services'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const MedicineEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    price: '',
    isActive: true
  })

  useEffect(() => {
    fetchMedicine()
  }, [id])

  const fetchMedicine = async () => {
    try {
      setLoading(true)
      const response = await medicineService.getMedicine(id)
      const medicine = response.data.medicine
      
      setFormData({
        name: medicine.name,
        description: medicine.description || '',
        unit: medicine.unit,
        price: medicine.price.toString(),
        isActive: medicine.isActive
      })
    } catch (error) {
      console.error('Fetch medicine error:', error)
      toast.error('Gagal memuat data obat')
      navigate('/medicines')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      
      // Validate price
      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        toast.error('Harga harus berupa angka positif')
        return
      }

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        unit: formData.unit.trim(),
        price: price,
        isActive: formData.isActive
      }

      await medicineService.updateMedicine(id, submitData)
      toast.success('Obat berhasil diperbarui')
      navigate('/medicines')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal memperbarui obat')
      console.error('Update medicine error:', error)
    } finally {
      setSubmitting(false)
    }
  }

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
          onClick={() => navigate('/medicines')}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Obat</h1>
          <p className="text-gray-600">Perbarui informasi obat</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informasi Obat</h2>
          
          <div className="space-y-6">
            {/* Medicine Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Obat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Contoh: Paracetamol 500mg"
                maxLength={150}
                required
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Satuan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
                placeholder="Contoh: Tablet, Botol, Strip, Kapsul"
                maxLength={50}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Satuan kemasan obat (misal: Tablet, Botol, Strip, Kapsul)
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                placeholder="Contoh: 5000"
                min="0"
                step="0.01"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Harga per satuan
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input w-full"
                placeholder="Deskripsi obat, indikasi, efek samping, dll..."
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Obat aktif (tersedia untuk digunakan)
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/medicines')}
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
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicineEdit
