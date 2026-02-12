import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import {
  adminListUsers,
  adminCreateInvite,
  adminGetSettings,
  adminUpdateSettings,
  adminGetOverview,
  adminGetActivity,
  adminExportProductsCsv,
  type AdminUser,
  type AdminActivityItem,
} from '../lib/api'

type TabId = 'overview' | 'users' | 'invites' | 'settings' | 'activity' | 'export'

const TABS: { id: TabId; labelKey: string }[] = [
  { id: 'overview', labelKey: 'admin.tab.overview' },
  { id: 'users', labelKey: 'admin.tab.users' },
  { id: 'invites', labelKey: 'admin.tab.invites' },
  { id: 'settings', labelKey: 'admin.tab.settings' },
  { id: 'activity', labelKey: 'admin.tab.activity' },
  { id: 'export', labelKey: 'admin.tab.export' },
]

function formatIsoDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AdminPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [settings, setSettings] = useState<{ inviteOnly: boolean } | null>(null)
  const [overview, setOverview] = useState<{ userCount: number; productCount: number; inviteOnly: boolean } | null>(null)
  const [activity, setActivity] = useState<AdminActivityItem[]>([])
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (user === null) return
    if (user && !user.admin) {
      navigate('/', { replace: true })
      return
    }
    Promise.all([
      adminListUsers(),
      adminGetSettings(),
      adminGetOverview(),
      adminGetActivity(50),
    ])
      .then(([u, s, o, a]) => {
        setUsers(u)
        setSettings(s)
        setOverview(o)
        setActivity(a)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false))
  }, [user, navigate])

  async function handleToggleInviteOnly() {
    if (settings == null || saving) return
    setSaving(true)
    setError(null)
    try {
      const next = !settings.inviteOnly
      const updated = await adminUpdateSettings({ inviteOnly: next })
      setSettings(updated)
      if (overview) setOverview({ ...overview, inviteOnly: updated.inviteOnly })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateInvite() {
    setError(null)
    try {
      const { link } = await adminCreateInvite()
      const fullLink = window.location.origin + link
      setInviteLink(fullLink)
      await navigator.clipboard.writeText(fullLink).catch(() => {})
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  async function handleExportProducts() {
    setError(null)
    setExporting(true)
    try {
      const url = await adminExportProductsCsv()
      const a = document.createElement('a')
      a.href = url
      a.download = 'products-export.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setExporting(false)
    }
  }

  if (user === null) return null
  if (!user.admin) return null

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {t('admin.title')}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:underline">{t('panel.close')}</button>
        </div>
      )}

      <div className="mb-6 border-b border-slate-200">
        <nav className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : (
        <>
          {activeTab === 'overview' && overview && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5 border-slate-200">
                  <p className="text-sm font-medium text-slate-500">{t('admin.overview.users')}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">{overview.userCount}</p>
                </div>
                <div className="card p-5 border-slate-200">
                  <p className="text-sm font-medium text-slate-500">{t('admin.overview.products')}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">{overview.productCount}</p>
                </div>
                <div className="card p-5 border-slate-200">
                  <p className="text-sm font-medium text-slate-500">{t('admin.overview.inviteOnly')}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">
                    {overview.inviteOnly ? t('common.yes') : t('common.no')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-500">{t('admin.overview.hint')}</p>
            </section>
          )}

          {activeTab === 'users' && (
            <section className="card p-5">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('admin.users')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="py-2 pr-4">{t('admin.username')}</th>
                      <th className="py-2 pr-4">{t('admin.email')}</th>
                      <th className="py-2">{t('admin.role')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-medium text-slate-800">{u.username}</td>
                        <td className="py-2 pr-4 text-slate-600">{u.email}</td>
                        <td className="py-2">
                          {u.admin ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 text-xs font-medium">
                              {t('admin.roleAdmin')}
                            </span>
                          ) : (
                            <span className="text-slate-500">{t('admin.roleUser')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'invites' && (
            <section className="card p-5">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('admin.invites')}</h2>
              <p className="mb-3 text-sm text-slate-600">{t('admin.invitesHint')}</p>
              <button type="button" onClick={handleCreateInvite} className="btn-primary">
                {t('admin.createInvite')}
              </button>
              {inviteLink && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="mb-1 font-medium text-slate-700">{t('admin.inviteLink')}</p>
                  <code className="block break-all text-slate-600">{inviteLink}</code>
                  <p className="mt-1 text-slate-500">{t('admin.inviteCopied')}</p>
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="card p-5">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('admin.settings')}</h2>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={settings?.inviteOnly ?? false}
                    onChange={handleToggleInviteOnly}
                    disabled={saving}
                    className="rounded"
                  />
                  {t('admin.inviteOnly')}
                </label>
                <p className="text-sm text-slate-500">{t('admin.inviteOnlyHint')}</p>
              </div>
            </section>
          )}

          {activeTab === 'activity' && (
            <section className="card p-5">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('admin.tab.activity')}</h2>
              <p className="mb-3 text-sm text-slate-500">{t('admin.activityHint')}</p>
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="py-2 pr-4">{t('admin.activityTime')}</th>
                      <th className="py-2 pr-4">{t('admin.activityProductId')}</th>
                      <th className="py-2 pr-4">{t('admin.activityAction')}</th>
                      <th className="py-2">{t('admin.activityDetails')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.length === 0 ? (
                      <tr><td colSpan={4} className="py-4 text-center text-slate-500">{t('panel.noAudit')}</td></tr>
                    ) : (
                      activity.map((a) => (
                        <tr key={a.id} className="border-b border-slate-100">
                          <td className="py-2 pr-4 text-slate-600 whitespace-nowrap">{formatIsoDate(a.createdAt)}</td>
                          <td className="py-2 pr-4 font-mono text-slate-700">{a.productId}</td>
                          <td className="py-2 pr-4 font-medium text-slate-800">{a.action}</td>
                          <td className="py-2 text-slate-600 max-w-xs truncate" title={a.details}>{a.details || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'export' && (
            <section className="card p-5">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('admin.tab.export')}</h2>
              <p className="mb-4 text-sm text-slate-600">{t('admin.exportHint')}</p>
              <button
                type="button"
                onClick={handleExportProducts}
                disabled={exporting}
                className="btn-primary"
              >
                {exporting ? t('common.loading') : t('admin.exportProducts')}
              </button>
            </section>
          )}
        </>
      )}
    </div>
  )
}
