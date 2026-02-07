import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { getToken } from './lib/api'
import './index.css'
import App from './App.tsx'
import OrderListPage from './pages/OrderListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!getToken() && location.pathname !== '/login') navigate('/login', { replace: true })
  }, [location.pathname, navigate])
  if (!getToken() && location.pathname !== '/login') return null
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route path="/login" element={<App><LoginPage /></App>} />
          <Route path="/" element={<App />} />
          <Route path="/order" element={<App><OrderListPage /></App>} />
          <Route path="/product/:id" element={<App><ProductDetailPage /></App>} />
          <Route path="/about" element={<App><AboutPage /></App>} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  </StrictMode>,
)
