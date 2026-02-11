import { useLocation } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'

type Props = { onClose: () => void }

const ROUTE_GUIDE_KEYS: Record<string, string> = {
  '/': 'about.guideDashboard',
  '/products': 'about.guideProducts',
  '/product': 'about.guideProducts',
  '/reports': 'about.guideReports',
  '/order': 'about.guideOrder',
  '/print-barcodes': 'about.guidePrint',
  '/import': 'about.guideImport',
  '/about': 'about.guideIntro',
}

export default function TourModal({ onClose }: Props) {
  const { t } = useI18n()
  const location = useLocation()
  const path = location.pathname.replace(/\/$/, '') || '/'
  const pathname = path.startsWith('/product/') ? '/product' : path
  const guideKey = ROUTE_GUIDE_KEYS[pathname] || ROUTE_GUIDE_KEYS['/'] || 'about.guideIntro'
  const content = t(guideKey)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-label={t('about.guideTitle')}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t('about.guideTitle')}</h2>
        <p className="text-sm text-slate-600 whitespace-pre-line">{content}</p>
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="btn-primary">
            {t('tour.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
