import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { patientService } from '../services'
import { ArrowLeft, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const PatientForm = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    allergies: ''
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
      setLoading(true)
      await patientService.createPatient(formData)
      toast.success(t('patients.form.registerSuccess'))
      navigate('/patients')
    } catch (error) {
      const errorMessage = error.response?.data?.error || t('patients.form.registerFailed')
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/patients')}
          className="btn btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('patients.form.back')}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('patients.form.title')}</h1>
          <p className="text-sm text-gray-600">{t('patients.form.subtitle')}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('patients.form.personalInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  {t('patients.form.fullName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="form-label">
                  {t('patients.form.dateOfBirth')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">
                  {t('patients.table.gender')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  className="form-input"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="MALE">{t('patients.gender.male')}</option>
                  <option value="FEMALE">{t('patients.gender.female')}</option>
                  <option value="OTHER">{t('patients.gender.other')}</option>
                </select>
              </div>

              <div>
                <label className="form-label">{t('patients.form.bloodType')}</label>
                <select
                  name="bloodType"
                  className="form-input"
                  value={formData.bloodType}
                  onChange={handleChange}
                >
                  <option value="">{t('patients.form.selectBloodType')}</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('patients.form.contactInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">{t('patients.form.phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="form-label">{t('patients.form.email')}</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@email.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">{t('patients.form.address')}</label>
                <textarea
                  name="address"
                  rows="3"
                  className="form-input"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('patients.form.emergencyContact')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">{t('patients.form.contactName')}</label>
                <input
                  type="text"
                  name="emergencyContact"
                  className="form-input"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label className="form-label">{t('patients.form.contactPhone')}</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  className="form-input"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('patients.form.medicalInfo')}</h3>
            <div>
              <label className="form-label">{t('patients.form.knownAllergies')}</label>
              <textarea
                name="allergies"
                rows="3"
                className="form-input"
                value={formData.allergies}
                onChange={handleChange}
                placeholder={t('patients.form.allergiesPlaceholder')}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="btn btn-secondary"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('patients.form.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('patients.form.registerButton')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PatientForm
