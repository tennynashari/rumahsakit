import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { visitService } from '../services'
import { ArrowLeft, Calendar, Clock, User, Stethoscope, FileText, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

const VisitDetail = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [visit, setVisit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVisitDetail()
  }, [id])

  const fetchVisitDetail = async () => {
    try {
      setLoading(true)
      const response = await visitService.getVisit(id)
      setVisit(response.data.visit)
    } catch (error) {
      console.error('Fetch visit error:', error)
      toast.error(t('visits.detail.fetchFailed'))
      navigate('/visits')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
    return new Date(dateString).toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getVisitTypeColor = (type) => {
    const colors = {
      GENERAL_CHECKUP: 'bg-green-50 text-green-700 border-green-200',
      OUTPATIENT: 'bg-blue-50 text-blue-700 border-blue-200',
      INPATIENT: 'bg-purple-50 text-purple-700 border-purple-200',
      EMERGENCY: 'bg-red-50 text-red-700 border-red-200'
    }
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getVisitTypeLabel = (type) => {
    const labels = {
      GENERAL_CHECKUP: t('visits.visitType.generalCheckup'),
      OUTPATIENT: t('visits.visitType.outpatient'),
      INPATIENT: t('visits.visitType.inpatient'),
      EMERGENCY: t('visits.visitType.emergency')
    }
    return labels[type] || type
  }

  const getStatusLabel = (status) => {
    const labels = {
      SCHEDULED: t('visits.status.scheduled'),
      IN_PROGRESS: t('visits.status.inProgress'),
      COMPLETED: t('visits.status.completed'),
      CANCELLED: t('visits.status.cancelled'),
      NO_SHOW: t('visits.status.noShow')
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!visit) {
    return <div className="text-center py-12">{t('visits.detail.notFound')}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/visits')}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('visits.form.back')}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('visits.detail.title')}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">{t('visits.detail.scheduleId')}: #{visit.id}</p>
              {visit.queueNumber && (
                <p className="text-sm font-mono font-bold text-primary-600 px-3 py-1 bg-primary-50 rounded">
                  {t('visits.detail.queueNumber')}: {visit.queueNumber}
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/visits/${id}/edit`)}
          className="inline-flex items-center px-5 py-2.5 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          {t('visits.detail.editVisit')}
        </button>
      </div>

      {/* Status and Type Banner */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg border-2 ${getVisitTypeColor(visit.visitType)}`}>
              <div className="text-sm font-medium">{t('visits.detail.visitType')}</div>
              <div className="text-lg font-bold">{getVisitTypeLabel(visit.visitType)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">{t('visits.detail.status')}</div>
              <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded ${getStatusBadge(visit.status)}`}>
                {getStatusLabel(visit.status)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{t('visits.detail.scheduledAt')}</div>
            <div className="text-lg font-semibold text-gray-900 flex items-center mt-1">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              {formatDateTime(visit.scheduledAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">{t('visits.detail.patientInfo')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">{t('visits.detail.patientName')}</label>
                <p className="font-medium text-gray-900">{visit.patient?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('visits.detail.mrn')}</label>
                <p className="font-medium text-gray-900">{visit.patient?.medicalRecordNo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('patients.gender.label')}</label>
                <p className="font-medium text-gray-900">{visit.patient?.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('patients.phone')}</label>
                <p className="font-medium text-gray-900">{visit.patient?.phone || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">{t('patients.address')}</label>
                <p className="font-medium text-gray-900">{visit.patient?.address || 'N/A'}</p>
              </div>
            </div>
            {visit.patient && (
              <button
                onClick={() => navigate(`/patients/${visit.patient.id}`)}
                className="btn-secondary mt-4"
              >
                {t('patients.viewPatientProfile')}
              </button>
            )}
          </div>

          {/* Doctor Information */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">{t('visits.detail.doctorInfo')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">{t('visits.detail.doctorName')}</label>
                <p className="font-medium text-gray-900">{visit.doctor?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('visits.detail.department')}</label>
                <p className="font-medium text-gray-900">{visit.doctor?.department || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('patients.email')}</label>
                <p className="font-medium text-gray-900">{visit.doctor?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('patients.phone')}</label>
                <p className="font-medium text-gray-900">{visit.doctor?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Visit Notes */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">{t('visits.detail.visitNotes')}</h2>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              {visit.notes ? (
                <p className="text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
              ) : (
                <p className="text-gray-500 italic">{t('visits.detail.noNotes')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">{t('visits.detail.timeline')}</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('visits.detail.created')}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(visit.createdAt).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('visits.detail.lastUpdated')}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(visit.updatedAt).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">{t('visits.detail.quickActions')}</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/visits/${id}/edit`)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('visits.detail.editVisit')}
              </button>
              <button
                onClick={() => navigate(`/patients/${visit.patient?.id}`)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!visit.patient}
              >
                <User className="w-4 h-4 mr-2" />
                {t('visits.detail.viewPatient')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitDetail
