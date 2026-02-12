import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { changePassword } from '../lib/api'
import LanguageSwitcher from '../components/LanguageSwitcher'
import CurrencySelector from '../components/CurrencySelector'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useI18n()

  useEffect(() => {
    refreshUser()
  }, [refreshUser])
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage(null)
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: t('settings.passwordMin') })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('settings.passwordMismatch') })
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordMessage({ type: 'success', text: t('settings.passwordUpdated') })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err instanceof Error ? err.message : t('common.error') })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {t('settings.title')}
      </h1>

      <div className="space-y-8">
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('settings.profile')}</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">{t('settings.username')}</dt>
              <dd className="font-medium text-slate-800">{user?.username ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('settings.email')}</dt>
              <dd className="font-medium text-slate-800">{user?.email || '—'}</dd>
            </div>
            {user?.admin && (
              <div>
                <dt className="text-slate-500">{t('settings.role')}</dt>
                <dd>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800">
                    {t('admin.roleAdmin')}
                  </span>
                </dd>
              </div>
            )}
          </dl>
          {user?.admin && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <Link
                to="/admin"
                className="inline-flex items-center rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 border border-amber-200 hover:bg-amber-200"
              >
                {t('nav.admin')} →
              </Link>
              <p className="mt-1 text-xs text-slate-500">{t('settings.adminPanelHint')}</p>
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('settings.changePassword')}</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">{t('settings.currentPassword')}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field w-full max-w-xs"
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">{t('settings.newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field w-full max-w-xs"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <p className="mt-0.5 text-xs text-slate-500">{t('settings.passwordHint')}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">{t('settings.confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field w-full max-w-xs"
                required
                autoComplete="new-password"
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {passwordMessage.text}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              {passwordLoading ? t('common.loading') : t('settings.savePassword')}
            </button>
          </form>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('settings.preferences')}</h2>
          <p className="mb-4 text-sm text-slate-500">{t('settings.preferencesHint')}</p>
          <div className="flex flex-wrap gap-6">
            <LanguageSwitcher />
            <CurrencySelector />
          </div>
        </section>

        <section className="card p-5 border-slate-200 bg-slate-50/50">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('settings.appSpecific')}</h2>
          <p className="text-sm text-slate-600">{t('settings.appSpecificHint')}</p>
        </section>
      </div>
    </div>
  )
}
