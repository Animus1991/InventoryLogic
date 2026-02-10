import type { StockMovement, AuditLog } from '../lib/api'
import { formatDateTime } from '../lib/locale'
import { useI18n } from '../contexts/I18nContext'

type Props = {
  showAudit: boolean
  movements: StockMovement[]
  auditLog: AuditLog[]
  onTabMovements: () => void
  onTabAudit: () => void
  onClose: () => void
}

export default function MovementsPanel({
  showAudit,
  movements,
  auditLog,
  onTabMovements,
  onTabAudit,
  onClose,
}: Props) {
  const { t } = useI18n()
  return (
    <div className="card mb-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-800">
          {showAudit ? t('panel.audit') : t('panel.movements')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTabMovements}
            className={`text-sm ${!showAudit ? 'font-medium text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('product.tabMovements')}
          </button>
          <button
            type="button"
            onClick={onTabAudit}
            className={`text-sm ${showAudit ? 'font-medium text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('product.tabAudit')}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">
            {t('panel.close')}
          </button>
        </div>
      </div>
      {showAudit ? (
        auditLog.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">{t('panel.noAudit')}</p>
        ) : (
          <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto text-sm">
            {auditLog.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-700">{a.action}</span>
                {a.details && <span className="flex-1 text-slate-500">{a.details}</span>}
                <span className="text-slate-400">{formatDateTime(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )
      ) : movements.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{t('product.noMovements')}</p>
      ) : (
        <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto text-sm">
          {movements.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span className={m.delta >= 0 ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>
                {m.delta >= 0 ? '+' : ''}{m.delta}
              </span>
              <span className="flex-1 text-slate-500">{m.note || '—'}</span>
              {m.reference && <span className="text-xs text-slate-500">{t('common.reference')}: {m.reference}</span>}
              <span className="text-slate-400">{formatDateTime(m.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
