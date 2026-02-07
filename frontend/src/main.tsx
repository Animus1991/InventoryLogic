import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import OrderListPage from './pages/OrderListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AboutPage from './pages/AboutPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/order" element={<App><OrderListPage /></App>} />
        <Route path="/product/:id" element={<App><ProductDetailPage /></App>} />
        <Route path="/about" element={<App><AboutPage /></App>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
