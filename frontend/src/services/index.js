import api from './api'

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken })
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },
}

export const patientService = {
  // Get all patients
  getPatients: async (params = {}) => {
    const response = await api.get('/patients', { params })
    return response.data
  },

  // Get single patient
  getPatient: async (id) => {
    const response = await api.get(`/patients/${id}`)
    return response.data
  },

  // Create patient
  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData)
    return response.data
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData)
    return response.data
  },

  // Delete patient
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`)
    return response.data
  },

  // Search patients
  searchPatients: async (query) => {
    const response = await api.get('/patients/search', { params: { q: query } })
    return response.data
  },
}

export const visitService = {
  // Get all visits
  getVisits: async (params = {}) => {
    const response = await api.get('/visits', { params })
    return response.data
  },

  // Get single visit
  getVisit: async (id) => {
    const response = await api.get(`/visits/${id}`)
    return response.data
  },

  // Create visit
  createVisit: async (visitData) => {
    const response = await api.post('/visits', visitData)
    return response.data
  },

  // Update visit
  updateVisit: async (id, visitData) => {
    const response = await api.put(`/visits/${id}`, visitData)
    return response.data
  },

  // Delete visit
  deleteVisit: async (id) => {
    const response = await api.delete(`/visits/${id}`)
    return response.data
  },
}

export const recordService = {
  // Get medical records
  getRecords: async (params = {}) => {
    const response = await api.get('/records', { params })
    return response.data
  },

  // Get single medical record
  getRecord: async (id) => {
    const response = await api.get(`/records/${id}`)
    return response.data
  },

  // Create medical record
  createRecord: async (recordData) => {
    const response = await api.post('/records', recordData)
    return response.data
  },

  // Update medical record
  updateRecord: async (id, recordData) => {
    const response = await api.put(`/records/${id}`, recordData)
    return response.data
  },

  // Delete medical record
  deleteRecord: async (id) => {
    const response = await api.delete(`/records/${id}`)
    return response.data
  },
}

export const medicineService = {
  // Get all medicines
  getMedicines: async (params = {}) => {
    const response = await api.get('/medicines', { params })
    return response.data
  },

  // Get single medicine
  getMedicine: async (id) => {
    const response = await api.get(`/medicines/${id}`)
    return response.data
  },

  // Create medicine
  createMedicine: async (medicineData) => {
    const response = await api.post('/medicines', medicineData)
    return response.data
  },

  // Update medicine
  updateMedicine: async (id, medicineData) => {
    const response = await api.put(`/medicines/${id}`, medicineData)
    return response.data
  },

  // Delete medicine
  deleteMedicine: async (id) => {
    const response = await api.delete(`/medicines/${id}`)
    return response.data
  },

  // Add batch
  addBatch: async (medicineId, batchData) => {
    const response = await api.post(`/medicines/${medicineId}/batches`, batchData)
    return response.data
  },

  // Update batch
  updateBatch: async (batchId, batchData) => {
    const response = await api.put(`/medicines/batches/${batchId}`, batchData)
    return response.data
  },

  // Delete batch
  deleteBatch: async (batchId) => {
    const response = await api.delete(`/medicines/batches/${batchId}`)
    return response.data
  },
}

export const billingService = {
  // Get all billings
  getBillings: async (params = {}) => {
    const response = await api.get('/billing', { params })
    return response.data
  },

  // Get single billing
  getBilling: async (id) => {
    const response = await api.get(`/billing/${id}`)
    return response.data
  },

  // Get billing statistics
  getBillingStats: async () => {
    const response = await api.get('/billing/stats')
    return response.data
  },

  // Create billing
  createBilling: async (billingData) => {
    const response = await api.post('/billing', billingData)
    return response.data
  },

  // Update billing
  updateBilling: async (id, billingData) => {
    const response = await api.put(`/billing/${id}`, billingData)
    return response.data
  },

  // Record payment
  recordPayment: async (id, paymentData) => {
    const response = await api.post(`/billing/${id}/payment`, paymentData)
    return response.data
  },

  // Delete billing
  deleteBilling: async (id) => {
    const response = await api.delete(`/billing/${id}`)
    return response.data
  },
}

export const userService = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Create user
  createUser: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // Get recent activities
  getActivities: async (params = {}) => {
    const response = await api.get('/dashboard/activities', { params })
    return response.data
  },
}
