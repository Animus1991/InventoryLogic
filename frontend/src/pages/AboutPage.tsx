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
      <p className="mt-4">
        <Link to="/" className="text-blue-600 hover:underline">← {t('about.backHome')}</Link>
      </p>
    </div>
  )
}
