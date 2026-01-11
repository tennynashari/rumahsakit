import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: enables sending cookies with requests
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Don't retry for /auth/me or /auth/refresh-token endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/me') || 
                          originalRequest.url?.includes('/auth/refresh-token')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        })

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login only if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api