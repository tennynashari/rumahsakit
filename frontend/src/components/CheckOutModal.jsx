import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { inpatientService } from '../services'
import { X, Calendar, FileText, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const CheckOutModal = ({ occupancy, isOpen, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    dischargeCondition: '',
    finalDiagnosis: '',
    dischargeNotes: '',
    checkedOutAt: new Date().toISOString().slice(0, 16)
  })

  const dischargeConditions = ['SEMBUH', 'MEMBAIK', 'RUJUK', 'MENINGGAL', 'APS']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.dischargeCondition) {
      toast.error(t('inpatients.selectDischargeCondition'))
      return
    }

    try {
      setSubmitting(true)
      
      const checkOutData = {
        dischargeCondition: formData.dischargeCondition,
        finalDiagnosis: formData.finalDiagnosis || undefined,
        dischargeNotes: formData.dischargeNotes || undefined,
        checkedOutAt: formData.checkedOutAt ? new Date(formData.checkedOutAt).toISOString() : undefined
      }

      await inpatientService.checkOutPatient(occupancy.id, checkOutData)
      toast.success(t('inpatients.checkOutSuccess'))
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.error || t('inpatients.checkOutFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '-'
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: i18n.language === 'id' ? 'IDR' : 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  if (!isOpen || !occupancy) return null

  const totalRoomCost = (occupancy.currentDays || 1) * (occupancy.room?.pricePerDay || 0)

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{t('inpatients.checkOut')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('inpatients.patientInfo')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">{t('inpatients.patient')}</p>
                <p className="font-medium">{occupancy.patient?.name}</p>
                <p className="text-gray-500">{occupancy.patient?.medicalRecordNo}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('rooms.room')}</p>
                <p className="font-medium">{occupancy.room?.roomNumber}</p>
                <p className="text-gray-500">Bed {occupancy.bedNumber || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('inpatients.checkInDate')}</p>
                <p className="font-medium">{formatDate(occupancy.checkedInAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('inpatients.lengthOfStay')}</p>
                <p className="font-medium">{occupancy.currentDays || 1} {t('inpatients.days')}</p>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-900">{t('inpatients.costSummary')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">{t('inpatients.roomCost')}</span>
                <span className="font-medium">{formatCurrency(occupancy.room?.pricePerDay)}/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">{t('inpatients.duration')}</span>
                <span className="font-medium">{occupancy.currentDays || 1} {t('inpatients.days')}</span>
              </div>
              <div className="flex justify-between border-t border-blue-300 pt-2">
                <span className="font-medium text-blue-900">{t('inpatients.totalRoomCost')}</span>
                <span className="font-bold text-blue-900">{formatCurrency(totalRoomCost)}</span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {t('inpatients.billingNote')}
              </p>
            </div>
          </div>

          {/* Check-out Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="checkedOutAt" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.checkOutDate')} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  id="checkedOutAt"
                  name="checkedOutAt"
                  value={formData.checkedOutAt}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().slice(0, 16)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dischargeCondition" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.dischargeCondition')} <span className="text-red-500">*</span>
              </label>
              <select
                id="dischargeCondition"
                name="dischargeCondition"
                value={formData.dischargeCondition}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t('common.select')}</option>
                {dischargeConditions.map(condition => (
                  <option key={condition} value={condition}>
                    {t(`inpatients.dischargeConditions.${condition}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="finalDiagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.finalDiagnosis')}
              </label>
              <div className="flex items-start space-x-2">
                <FileText className="w-5 h-5 text-gray-400 mt-2" />
                <textarea
                  id="finalDiagnosis"
                  name="finalDiagnosis"
                  value={formData.finalDiagnosis}
                  onChange={handleChange}
                  rows="3"
                  placeholder={t('inpatients.finalDiagnosisPlaceholder')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dischargeNotes" className="block text-sm font-medium text-gray-700 mb-1">
                {t('inpatients.dischargeNotes')}
              </label>
              <textarea
                id="dischargeNotes"
                name="dischargeNotes"
                value={formData.dischargeNotes}
                onChange={handleChange}
                rows="3"
                placeholder={t('inpatients.dischargeNotesPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary inline-flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('common.saving')}
                </>
              ) : (
                <>
                  {t('inpatients.confirmCheckOut')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckOutModal
