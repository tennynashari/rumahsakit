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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to fetch current user with cookies
        const response = await authService.me()
        if (response.data.user) {
          dispatch({ type: 'SET_USER', payload: response.data.user })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authService.login(credentials)
      const { user } = response.data

      dispatch({ type: 'SET_USER', payload: user })
      toast.success('Login successful!')
      
      return response
    } catch (error) {
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