import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { billingService } from '../services'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const BillingEdit = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    items: [
      { description: '', amount: '' }
    ],
    tax: '10',
    discount: '0',
    status: 'UNPAID'
  })

  useEffect(() => {
    fetchBilling()
  }, [id])

  const fetchBilling = async () => {
    try {
      setLoading(true)
      const response = await billingService.getBilling(id)
      const billing = response.data.billing
      
      setFormData({
        patientName: billing.patient.name,
        items: Array.isArray(billing.items) ? billing.items.map(item => ({
          description: item.description || '',
          amount: item.amount ? item.amount.toString() : ''
        })) : [{ description: '', amount: '' }],
        tax: ((parseFloat(billing.tax) / parseFloat(billing.subtotal)) * 100).toFixed(2),
        discount: billing.discount.toString(),
        status: billing.status
      })
    } catch (error) {
      console.error('Fetch billing error:', error)
      toast.error(t('billing.form.loadFailed'))
      navigate('/billing')
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
        toast.error(t('billing.form.validation.itemRequired'))
        return
      }

      const { subtotal, tax, discount, total } = calculateTotals()

      const submitData = {
        items: formData.items.map(item => ({
          description: item.description.trim(),
          amount: parseFloat(item.amount)
        })),
        subtotal,
        tax,
        discount,
        total,
        status: formData.status
      }

      await billingService.updateBilling(id, submitData)
      toast.success(t('billing.form.updateSuccess'))
      navigate('/billing')
    } catch (error) {
      toast.error(error.response?.data?.error || t('billing.form.updateFailed'))
      console.error('Update billing error:', error)
    } finally {
      setSubmitting(false)
    }
  }

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
          {t('billing.form.back')}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('billing.form.editTitle')}</h1>
          <p className="text-gray-600">{t('billing.form.editSubtitle')}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t('billing.detail.patientInfo')}</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('billing.form.patient')}
            </label>
            <input
              type="text"
              value={formData.patientName}
              className="input bg-gray-100 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">{t('patients.form.readOnlyNote')}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t('billing.form.items')}</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn btn-sm bg-primary-600 text-white hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('billing.form.addItem')}
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
                    placeholder={t('billing.form.descriptionPlaceholder')}
                    required
                  />
                </div>
                <div className="w-48">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="input"
                    placeholder={t('billing.form.amountPlaceholder')}
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
          <h2 className="text-lg font-semibold mb-4">{t('billing.form.calculations')} & {t('billing.table.status')}</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('billing.form.taxPercent')}
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
                  {t('billing.form.discountAmount')}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('billing.table.status')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="UNPAID">{t('billing.status.unpaid')}</option>
                  <option value="PAID">{t('billing.status.paid')}</option>
                  <option value="CANCELLED">{t('billing.status.cancelled')}</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('billing.table.subtotal')}:</span>
                <span className="font-medium">{new Intl.NumberFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: i18n.language === 'id' ? 'IDR' : 'USD', minimumFractionDigits: 0 }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('billing.table.tax')} ({formData.tax}%):</span>
                <span className="font-medium">{new Intl.NumberFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: i18n.language === 'id' ? 'IDR' : 'USD', minimumFractionDigits: 0 }).format(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('billing.table.discount')}:</span>
                <span className="font-medium text-red-600">- {new Intl.NumberFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: i18n.language === 'id' ? 'IDR' : 'USD', minimumFractionDigits: 0 }).format(discount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t('billing.table.total')}:</span>
                <span className="text-primary-600">{new Intl.NumberFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: i18n.language === 'id' ? 'IDR' : 'USD', minimumFractionDigits: 0 }).format(total)}</span>
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
                {t('billing.form.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('billing.form.updateButton')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BillingEdit
