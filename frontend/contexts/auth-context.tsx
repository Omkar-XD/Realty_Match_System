'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '@/lib/types'
import { demoUsers } from '@/lib/demo-data'

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => boolean
  loginWithPhone: (phone: string, otp: string) => boolean
  logout: () => void
  isAdmin: boolean
  isStaff: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const login = useCallback((email: string, password: string): boolean => {
    const user = demoUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (user) {
      setCurrentUser(user)
      return true
    }
    return false
  }, [])

  const loginWithPhone = useCallback((phone: string, otp: string): boolean => {
    // Demo OTP is always 123456
    if (otp !== '123456') return false
    
    // Normalize phone number for comparison
    const normalizedPhone = phone.replace(/\s/g, '').replace('+91', '')
    const user = demoUsers.find((u) => {
      const userPhone = u.phone_number.replace(/\s/g, '').replace('+91', '')
      return userPhone === normalizedPhone
    })
    
    if (user) {
      setCurrentUser(user)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const isAdmin = currentUser?.role === 'admin'
  const isStaff = currentUser?.role === 'staff'

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        loginWithPhone,
        logout,
        isAdmin,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
