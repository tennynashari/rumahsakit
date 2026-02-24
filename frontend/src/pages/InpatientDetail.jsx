import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { inpatientService } from '../services'
import { ArrowLeft, Edit, User, Bed, Calendar, DollarSign, FileText, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

const InpatientDetail = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [occupancy, setOccupancy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOccupancy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchOccupancy = async () => {
    try {
      setLoading(true)
      const response = await inpatientService.getInpatient(id)
      setOccupancy(response.data?.occupancy || response.data)
    } catch (error) {
      toast.error(t('inpatients.loadFailed'))
      console.error('Fetch occupancy error:', error)
      navigate('/inpatients')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
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

  const getStatusColor = (status) => {
    return status === 'ACTIVE' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!occupancy) {
    return null
  }

  const totalCost = occupancy.room?.pricePerDay 
    ? (occupancy.currentDays || 1) * occupancy.room.pricePerDay 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/inpatients')}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {occupancy.registrationNumber}
            </h1>
            <p className="text-gray-600">{t('inpatients.inpatientDetail')}</p>
          </div>
        </div>
        {occupancy.status === 'ACTIVE' && (
          <Link
            to={`/inpatients/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            {t('inpatients.editOccupancy')}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">{t('inpatients.patientInfo')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('inpatients.medicalRecordNo')}</p>
                <p className="font-medium">{occupancy.patient?.medicalRecordNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('inpatients.patientName')}</p>
                <p className="font-medium">{occupancy.patient?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('patients.gender')}</p>
                <p className="font-medium">
                  {occupancy.patient?.gender === 'MALE' ? t('patients.male') : t('patients.female')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('patients.phone')}</p>
                <p className="font-medium">{occupancy.patient?.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Bed className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">{t('inpatients.roomInfo')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('rooms.roomNumber')}</p>
                <p className="font-medium">{occupancy.room?.roomNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('rooms.roomName')}</p>
                <p className="font-medium">{occupancy.room?.roomName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('rooms.roomType')}</p>
                <p className="font-medium">{t(`rooms.types.${occupancy.room?.roomType}`)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('inpatients.bedNumber')}</p>
                <p className="font-medium">{occupancy.bedNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('rooms.floor')}</p>
                <p className="font-medium">Floor {occupancy.room?.floor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('rooms.pricePerDay')}</p>
                <p className="font-medium">{formatCurrency(occupancy.room?.pricePerDay)}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">{t('inpatients.medicalInfo')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{t('inpatients.doctor')}</p>
                <p className="font-medium">{occupancy.doctor?.name}</p>
                <p className="text-sm text-gray-500">{occupancy.doctor?.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('inpatients.initialDiagnosis')}</p>
                <p className="font-medium">{occupancy.initialDiagnosis || '-'}</p>
              </div>
              {occupancy.finalDiagnosis && (
                <div>
                  <p className="text-sm text-gray-600">{t('inpatients.finalDiagnosis')}</p>
                  <p className="font-medium">{occupancy.finalDiagnosis}</p>
                </div>
              )}
              {occupancy.careClass && (
                <div>
                  <p className="text-sm text-gray-600">{t('inpatients.careClass')}</p>
                  <p className="font-medium">{occupancy.careClass}</p>
                </div>
              )}
              {occupancy.notes && (
                <div>
                  <p className="text-sm text-gray-600">{t('inpatients.notes')}</p>
                  <p className="font-medium">{occupancy.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">{t('inpatients.timeline')}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">{t('inpatients.checkInDate')}</p>
                  <p className="font-medium">{formatDate(occupancy.checkedInAt)}</p>
                </div>
                {occupancy.estimatedCheckoutAt && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{t('inpatients.estimatedCheckout')}</p>
                    <p className="font-medium">{formatDate(occupancy.estimatedCheckoutAt)}</p>
                  </div>
                )}
              </div>
              {occupancy.checkedOutAt && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">{t('inpatients.actualCheckout')}</p>
                    <p className="font-medium">{formatDate(occupancy.checkedOutAt)}</p>
                  </div>
                  {occupancy.dischargeCondition && (
                    <div>
                      <p className="text-sm text-gray-600">{t('inpatients.dischargeCondition')}</p>
                      <p className="font-medium">
                        {t(`inpatients.dischargeConditions.${occupancy.dischargeCondition}`)}
                      </p>
                    </div>
                  )}
                  {occupancy.dischargeNotes && (
                    <div>
                      <p className="text-sm text-gray-600">{t('inpatients.dischargeNotes')}</p>
                      <p className="font-medium">{occupancy.dischargeNotes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t('common.status')}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(occupancy.status)}`}>
              {occupancy.status === 'ACTIVE' ? t('inpatients.active') : t('inpatients.checkedOut')}
            </span>
          </div>

          {/* Duration Card */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-5 h-5 text-primary-600" />
              <h3 className="text-sm font-medium text-gray-600">{t('inpatients.lengthOfStay')}</h3>
            </div>
            <p className="text-3xl font-bold text-primary-600">
              {occupancy.currentDays || occupancy.actualDays || 1}
            </p>
            <p className="text-sm text-gray-600">{t('inpatients.days')}</p>
          </div>

          {/* Cost Summary */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h3 className="text-sm font-medium text-gray-600">{t('inpatients.costSummary')}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('inpatients.roomCost')}</span>
                <span className="font-medium">{formatCurrency(occupancy.room?.pricePerDay)}/day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('inpatients.duration')}</span>
                <span className="font-medium">
                  {occupancy.currentDays || occupancy.actualDays || 1} {t('inpatients.days')}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">{t('inpatients.totalRoomCost')}</span>
                <span className="font-bold text-primary-600">
                  {formatCurrency(occupancy.totalRoomCost || totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Card */}
          {occupancy.billing && (
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-3">{t('billing.billing')}</h3>
              <Link
                to={`/billing/${occupancy.billing.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('billing.viewBilling')} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InpatientDetail
