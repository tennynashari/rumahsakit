import api from './api'

const roomService = {
  // Get all rooms with filters
  getRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params })
    return response.data
  },

  // Get single room by ID
  getRoom: async (id) => {
    const response = await api.get(`/rooms/${id}`)
    return response.data
  },

  // Create new room
  createRoom: async (data) => {
    const response = await api.post('/rooms', data)
    return response.data
  },

  // Update room
  updateRoom: async (id, data) => {
    const response = await api.put(`/rooms/${id}`, data)
    return response.data
  },

  // Delete room (soft delete)
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`)
    return response.data
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/rooms/dashboard/stats')
    return response.data
  },

  // Export rooms to Excel
  exportRoomsExcel: async (params = {}) => {
    const response = await api.get('/rooms/export', {
      params,
      responseType: 'blob'
    })
    return response
  },
}

export default roomService
