import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { getToken, AUTH_REQUIRED_EVENT } from './lib/api'
import { I18nProvider } from './contexts/I18nContext'
import './index.css'
import App from './App.tsx'
import DashboardPage from './pages/DashboardPage'
import OrderListPage from './pages/OrderListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AboutPage from './pages/AboutPage'
import AuthPage from './pages/AuthPage'
import ReportsPage from './pages/ReportsPage'
import BarcodePrintPage from './pages/BarcodePrintPage'
import ImportPage from './pages/ImportPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  useEffect(() => {
    if (!getToken() && !isAuthPage) navigate('/login', { replace: true })
  }, [location.pathname, navigate, isAuthPage])

  useEffect(() => {
    const handler = () => navigate('/login', { replace: true })
    window.addEventListener(AUTH_REQUIRED_EVENT, handler)
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, handler)
  }, [navigate])

  if (!getToken() && !isAuthPage) return null
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <AuthGuard>
        <Routes>
          <Route path="/login" element={<App><AuthPage /></App>} />
          <Route path="/signup" element={<App><AuthPage /></App>} />
          <Route path="/" element={<App><DashboardPage /></App>} />
          <Route path="/products" element={<App />} />
          <Route path="/order" element={<App><OrderListPage /></App>} />
          <Route path="/reports" element={<App><ReportsPage /></App>} />
          <Route path="/print-barcodes" element={<App><BarcodePrintPage /></App>} />
          <Route path="/import" element={<App><ImportPage /></App>} />
          <Route path="/product/:id" element={<App><ProductDetailPage /></App>} />
          <Route path="/about" element={<App><AboutPage /></App>} />
        </Routes>
        </AuthGuard>
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
)
