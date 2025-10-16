import React, { createContext, useState, useContext, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          api.defaults.headers.Authorization = `Bearer ${token}`
          fetchUser()
        } else {
          localStorage.removeItem('token')
          setLoading(false)
        }
      } catch (error) {
        localStorage.removeItem('token')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      // We'll get user info from the token or make an API call
      // For now, we'll set a placeholder until we implement user endpoint
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.Authorization = `Bearer ${token}`
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.Authorization = `Bearer ${token}`
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.Authorization
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
