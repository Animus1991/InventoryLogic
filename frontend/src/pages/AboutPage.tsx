import { Link } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'

export default function AboutPage() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">{t('about.title')}</h2>
      <p className="mb-3 text-slate-600">{t('about.intro')}</p>
      <p className="mb-3 text-slate-600">{t('about.tech')}</p>
      <ul className="list-inside list-disc text-sm text-slate-600">
        <li>{t('about.feature1')}</li>
        <li>{t('about.feature2')}</li>
        <li>{t('about.feature3')}</li>
        <li>{t('about.feature4')}</li>
        <li>{t('about.feature5')}</li>
        <li>{t('about.feature6')}</li>
      </ul>
      <h3 className="mt-6 mb-2 text-base font-semibold text-slate-800">{t('about.guideTitle')}</h3>
      <p className="mb-3 text-sm text-slate-600">{t('about.guideIntro')}</p>
      <ul className="list-inside list-disc text-sm text-slate-600 space-y-1">
        <li><strong>{t('nav.dashboard')}:</strong> {t('about.guideDashboard')}</li>
        <li><strong>{t('nav.products')}:</strong> {t('about.guideProducts')}</li>
        <li><strong>{t('nav.reports')}:</strong> {t('about.guideReports')}</li>
        <li><strong>{t('nav.order')}:</strong> {t('about.guideOrder')}</li>
        <li><strong>{t('nav.printBarcodes')}:</strong> {t('about.guidePrint')}</li>
        <li><strong>{t('nav.import')}:</strong> {t('about.guideImport')}</li>
      </ul>
      <p className="mt-4">
        <Link to="/" className="text-blue-600 hover:underline">← {t('about.backHome')}</Link>
      </p>
    </div>
  )
}
