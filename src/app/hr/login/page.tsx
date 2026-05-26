'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function HRLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/hr')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-fynlo-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-fynlo-teal font-black text-3xl tracking-tight mb-1">HR Portal</div>
          <div className="text-fynlo-subtle text-sm">Sign in to your dashboard</div>
        </div>

        <div className="bg-white rounded-card shadow-card p-8">
          <h1 className="text-xl font-bold text-fynlo-dark mb-6">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-fynlo-body mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-fynlo-dark text-sm focus:outline-none focus:ring-2 focus:ring-fynlo-teal/30 focus:border-fynlo-teal transition-colors"
                placeholder="hr@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-fynlo-body mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-fynlo-dark text-sm focus:outline-none focus:ring-2 focus:ring-fynlo-teal/30 focus:border-fynlo-teal transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fynlo-subtle hover:text-fynlo-dark transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-fynlo-terra font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fynlo-teal text-white font-bold py-3 rounded-btn text-sm hover:bg-fynlo-teal/90 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-fynlo-subtle hover:text-fynlo-teal transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>
      </div>

      {showForgotModal && (
        <ForgotPasswordModal
          initialEmail={email}
          onClose={() => setShowForgotModal(false)}
        />
      )}
    </div>
  )
}

// ── Forgot password modal ─────────────────────────────────────────────
function ForgotPasswordModal({
  initialEmail,
  onClose,
}: {
  initialEmail: string
  onClose: () => void
}) {
  const [resetEmail, setResetEmail] = useState(initialEmail)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setResult(null)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/hr/reset-password`,
    })

    if (error) {
      // Don't disclose whether the email exists — same message either way
      setResult({ ok: true, message: 'If that email is registered, a reset link has been sent. Check your inbox (and spam folder).' })
    } else {
      setResult({ ok: true, message: 'If that email is registered, a reset link has been sent. Check your inbox (and spam folder).' })
    }
    setSending(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget && !sending) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-fynlo-dark">Reset your password</h3>
          <button onClick={onClose} disabled={sending} className="text-fynlo-subtle hover:text-fynlo-dark transition-colors disabled:opacity-40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!result ? (
          <form onSubmit={handleSend}>
            <p className="text-sm text-fynlo-body mb-4">
              Enter your HR email below. We&apos;ll send you a link to set a new password.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              placeholder="hr@company.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-fynlo-dark text-sm focus:outline-none focus:ring-2 focus:ring-fynlo-teal/30 focus:border-fynlo-teal transition-colors mb-5"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !resetEmail.trim()}
                className="flex-1 py-2.5 rounded-xl bg-fynlo-teal text-white text-sm font-semibold hover:bg-fynlo-teal/90 transition-colors disabled:opacity-40"
              >
                {sending ? 'Sending…' : 'Send reset link'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-green-50 text-green-800">
              {result.message}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  )
}
