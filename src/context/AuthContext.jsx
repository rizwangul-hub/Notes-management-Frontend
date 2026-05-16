import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(!!getToken())

  const refreshProfile = useCallback(async () => {
    if (!getToken()) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await api('/api/auth/profile')
      setProfile(data)
    } catch {
      setProfile(null)
      setToken(null)
      setTokenState(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  const login = useCallback(async (email, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.token) {
      setToken(data.token)
      setTokenState(data.token)
      await refreshProfile()
    }
    return data
  }, [refreshProfile])

  const register = useCallback(async (name, email, password) => {
    return api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      profile,
      loading,
      isAuthenticated: Boolean(token && profile),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [token, profile, loading, login, register, logout, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
