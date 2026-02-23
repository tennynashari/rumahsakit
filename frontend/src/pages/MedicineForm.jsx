import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { medicineService } from '../services'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const MedicineForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    price: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      
      // Validate price
      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        toast.error(t('medicines.form.priceValidation'))
        return
      }

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        unit: formData.unit.trim(),
        price: price
      }

      await medicineService.createMedicine(submitData)
      toast.success(t('medicines.form.createSuccess'))
      navigate('/medicines')
    } catch (error) {
      toast.error(error.response?.data?.error || t('medicines.form.createFailed'))
      console.error('Create medicine error:', error)
    } finally {
      setSubmitting(false)
    }
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
          {t('medicines.form.back')}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('medicines.form.title')}</h1>
          <p className="text-gray-600">{t('medicines.form.subtitle')}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t('medicines.form.medicineInfo')}</h2>
          
          <div className="space-y-6">
            {/* Medicine Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('medicines.form.medicineName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder={t('medicines.form.medicineNamePlaceholder')}
                maxLength={150}
                required
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('medicines.form.unit')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
                placeholder={t('medicines.form.unitPlaceholder')}
                maxLength={50}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('medicines.form.unitHelp')}
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('medicines.form.price')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                placeholder={t('medicines.form.pricePlaceholder')}
                min="0"
                step="0.01"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('medicines.form.priceHelp')}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('medicines.form.description')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input w-full"
                placeholder={t('medicines.form.descriptionPlaceholder')}
              />
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
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t('medicines.form.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('medicines.form.saveButton')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicineForm
