import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { recordService, patientService, visitService, userService } from '../services'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const RecordForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [patients, setPatients] = useState([])
  const [visits, setVisits] = useState([])
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState({
    visitId: '',
    patientId: '',
    doctorId: '',
    diagnosisCode: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsResponse, visitsResponse, usersResponse] = await Promise.all([
        patientService.getPatients(),
        visitService.getVisits({ limit: 1000 }),
        userService.getUsers()
      ])

      setPatients(patientsResponse.data.patients || [])
      setVisits(visitsResponse.data.visits || [])
      
      // Filter doctors from users
      const usersList = usersResponse?.data?.users || usersResponse?.data || []
      const doctorsList = usersList.filter(user => user.role === 'DOCTOR')
      setDoctors(doctorsList)
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

  const handleVisitChange = (e) => {
    const visitId = parseInt(e.target.value)
    const selectedVisit = visits.find(v => v.id === visitId)
    
    setFormData(prev => ({
      ...prev,
      visitId: visitId,
      patientId: selectedVisit?.patientId || prev.patientId,
      doctorId: selectedVisit?.doctorId || prev.doctorId
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      
      // Prepare data
      const submitData = {
        visitId: parseInt(formData.visitId),
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        diagnosisCode: formData.diagnosisCode || null,
        symptoms: formData.symptoms || null,
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        prescription: formData.prescription ? JSON.parse(formData.prescription) : null
      }

      await recordService.createRecord(submitData)
      toast.success('Rekam medis berhasil ditambahkan')
      navigate('/records')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal membuat rekam medis')
      console.error('Create record error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter visits by selected patient
  const filteredVisits = formData.patientId 
    ? visits.filter(v => v.patientId === formData.patientId)
    : visits

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
          onClick={() => navigate('/records')}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Rekam Medis</h1>
          <p className="text-gray-600">Buat rekam medis elektronik pasien</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informasi Kunjungan</h2>
          
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

            {/* Visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kunjungan <span className="text-red-500">*</span>
              </label>
              <select
                name="visitId"
                value={formData.visitId}
                onChange={handleVisitChange}
                className="input"
                required
                disabled={!formData.patientId}
              >
                <option value="">Pilih Kunjungan</option>
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

            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dokter <span className="text-red-500">*</span>
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Pilih Dokter</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.department || 'Umum'}
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnosis Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Diagnosis (ICD-10)
              </label>
              <input
                type="text"
                name="diagnosisCode"
                value={formData.diagnosisCode}
                onChange={handleChange}
                className="input"
                placeholder="Contoh: J00"
                maxLength={20}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Catatan Medis</h2>
          
          <div className="space-y-6">
            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keluhan/Gejala
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="4"
                className="input w-full"
                placeholder="Keluhan yang dialami pasien..."
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows="4"
                className="input w-full"
                placeholder="Diagnosis medis..."
              />
            </div>

            {/* Treatment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tindakan/Terapi
              </label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                rows="4"
                className="input w-full"
                placeholder="Tindakan medis atau terapi yang diberikan..."
              />
            </div>

            {/* Prescription */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resep (JSON)
              </label>
              <textarea
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                rows="5"
                className="input w-full font-mono text-sm"
                placeholder='{"medicines": [{"name": "Paracetamol", "dosage": "500mg", "frequency": "3x sehari"}]}'
              />
              <p className="text-sm text-gray-500 mt-1">
                Format JSON. Contoh: {`{"medicines": [{"name": "...", "dosage": "...", "frequency": "..."}]}`}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/records')}
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

export default RecordForm
