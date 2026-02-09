import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login, register, setToken, getToken } from '../lib/api'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const location = useLocation()
  const mode: Mode = location.pathname === '/signup' ? 'signup' : 'login'

  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    setError(null)
    setSuccess(null)
  }, [mode])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!emailOrUsername.trim() || !password || submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const data = await login(emailOrUsername.trim(), password)
      setToken(data.token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα σύνδεσης')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !username.trim() || !password || submitting) return
    if (password.length < 6) {
      setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
      return
    }
    if (password !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Μη έγκυρη διεύθυνση email')
      return
    }
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const data = await register(email.trim().toLowerCase(), username.trim(), password)
      setToken(data.token)
      setSuccess('Ο λογαριασμός δημιουργήθηκε. Ανακατεύθυνση...')
      setTimeout(() => navigate('/', { replace: true }), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Αποτυχία εγγραφής')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <Link
              to="/login"
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition ${
                mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Σύνδεση
            </Link>
            <Link
              to="/signup"
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition ${
                mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Εγγραφή
            </Link>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <h1 className="text-xl font-bold text-slate-800">Καλώς ήρθες πάλι</h1>
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm" role="alert">
                  <p className="font-medium">Σφάλμα σύνδεσης</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}
              <div>
                <label htmlFor="login-id" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email ή username
                </label>
                <input
                  id="login-id"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="input-field"
                  placeholder="π.χ. admin@inventory.local ή admin"
                  autoComplete="username email"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Κωδικός
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                {submitting ? 'Σύνδεση...' : 'Σύνδεση'}
              </button>
              <p className="text-center text-xs text-slate-500">
                <button type="button" onClick={() => alert('Επικοινωνήστε με το διαχειριστή για επαναφορά κωδικού.')} className="text-blue-600 hover:underline">
                  Ξέχασα τον κωδικό
                </button>
              </p>
              <p className="text-center text-sm text-slate-500">
                Demo: admin@inventory.local / admin
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <h1 className="text-xl font-bold text-slate-800">Δημιουργία λογαριασμού</h1>
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm" role="alert">
                  <p className="font-medium">Σφάλμα εγγραφής</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
                  {success}
                </div>
              )}
              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="το email σας"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="signup-username" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="αναγνωριστικό σας"
                  autoComplete="username"
                  minLength={2}
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Κωδικός (min 6 χαρακτήρες)
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Επιβεβαίωση κωδικού
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                {submitting ? 'Δημιουργία...' : 'Εγγραφή'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>Δεν έχετε λογαριασμό; <Link to="/signup" className="font-medium text-blue-600 hover:underline">Εγγραφή</Link></>
            ) : (
              <>Έχετε ήδη λογαριασμό; <Link to="/login" className="font-medium text-blue-600 hover:underline">Σύνδεση</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
