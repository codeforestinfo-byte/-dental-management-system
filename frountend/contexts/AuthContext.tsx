'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authService } from '@/services/auth.service'
import { setTokens, clearTokens, getAccessToken } from '@/lib/auth'
import type { UserResponse } from '@/types/auth.types'

interface AuthContextType {
  user: UserResponse | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await authService.getMe()
      if (res.success && res.data) {
        setUser(res.data)
      } else {
        clearTokens()
      }
    } catch {
      clearTokens()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
  }, [loading, user])

  const login = async (username: string, password: string) => {
    const res = await authService.login({ username, password })
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken)
      setUser({
        id: 0,
        username: res.data.username,
        email: '',
        enabled: true,
        roles: res.data.roles,
        createdAt: '',
      })
      window.location.href = '/'
    } else {
      throw new Error(res.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens()
      setUser(null)
      window.location.href = '/login'
    }
  }

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
