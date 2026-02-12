import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getToken, getMe, AUTH_REQUIRED_EVENT, type Me } from '../lib/api'

const AUTH_LOGGED_IN_EVENT = 'inventory:user-logged-in'
const AUTH_LOGGED_OUT_EVENT = 'inventory:user-logged-out'

export function emitLoggedIn(): void {
  window.dispatchEvent(new CustomEvent(AUTH_LOGGED_IN_EVENT))
}

export function emitLoggedOut(): void {
  window.dispatchEvent(new CustomEvent(AUTH_LOGGED_OUT_EVENT))
}

type AuthContextValue = {
  user: Me | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null)

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return
    }
    const me = await getMe()
    setUser(me)
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    const onAuthRequired = () => setUser(null)
    const onLoggedOut = () => setUser(null)
    const onLoggedIn = () => refreshUser()
    const onFocus = () => refreshUser()
    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired)
    window.addEventListener(AUTH_LOGGED_OUT_EVENT, onLoggedOut)
    window.addEventListener(AUTH_LOGGED_IN_EVENT, onLoggedIn)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired)
      window.removeEventListener(AUTH_LOGGED_OUT_EVENT, onLoggedOut)
      window.removeEventListener(AUTH_LOGGED_IN_EVENT, onLoggedIn)
      window.removeEventListener('focus', onFocus)
    }
  }, [refreshUser])

  const value: AuthContextValue = { user, refreshUser }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
