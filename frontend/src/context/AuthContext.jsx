import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  loading: true,
  error: null,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken')
      const userData = localStorage.getItem('user')

      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          dispatch({ type: 'SET_USER', payload: user })
        } catch (error) {
          // Invalid stored data, clear it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authService.login(credentials)
      console.log('AuthContext - Login response:', response)
      
      // authService.login returns response.data from axios
      // Backend returns: { success: true, data: { user, accessToken, refreshToken } }
      // So response is already { success: true, data: { ... } }
      const { user, accessToken, refreshToken } = response.data

      console.log('Extracted data:', { user, accessToken: accessToken?.substring(0, 20), refreshToken: refreshToken?.substring(0, 20) })

      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({ type: 'SET_USER', payload: user })
      toast.success('Login successful!')
      
      return response
    } catch (error) {
      console.error('AuthContext - Login error:', error)
      const errorMessage = error.response?.data?.error || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authService.register(userData)
      toast.success('Registration successful!')
      
      dispatch({ type: 'SET_LOADING', payload: false })
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear local storage and state
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}