import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register, login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(name, email, password)
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 text-left">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Create account</h1>
        <p className="mt-2 text-[var(--text)]">Registers against your backend at <code className="text-xs">/api/auth/register</code>.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--code-bg)]/40 p-6 shadow-[var(--shadow)]">
        {error ? (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-h)]">
          Name
          <input
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-h)]">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-h)]">
          Password
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Register & sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text)]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
