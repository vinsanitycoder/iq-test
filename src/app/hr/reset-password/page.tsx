'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

/**
 * Landing page for the password reset email link.
 * Supabase Auth sets a temporary recovery session when the user clicks the
 * link in the email. This page detects that session and lets them set a
 * new password.
 */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'checking' | 'ready' | 'invalid' | 'done'>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    // Supabase auto-hydrates the recovery session from the URL fragment.
    // If a session is present, the user is allowed to set a new password.
    supabase.auth.getSession().then(({ data }) => {
      setPhase(data.session ? 'ready' : 'invalid')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords don’t match.')
      return
    }

    setSaving(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setPhase('done')
    setTimeout(() => router.push('/hr'), 2500)
  }

  return (
    <div className="min-h-screen bg-fynlo-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-fynlo-teal font-black text-3xl tracking-tight mb-1">HR Portal</div>
          <div className="text-fynlo-subtle text-sm">Set a new password</div>
        </div>

        <div className="bg-white rounded-card shadow-card p-8">
          {phase === 'checking' && (
            <p className="text-sm text-fynlo-subtle text-center py-4">Verifying link…</p>
          )}

          {phase === 'invalid' && (
            <>
              <h1 className="text-xl font-bold text-fynlo-dark mb-3">This link doesn&apos;t work</h1>
              <p className="text-sm text-fynlo-body mb-5">
                The reset link is invalid or has expired. Reset links are only valid for a short time.
                Please request a new one from the sign-in page.
              </p>
              <button
                onClick={() => router.push('/hr/login')}
                className="w-full bg-fynlo-teal text-white font-bold py-3 rounded-btn text-sm hover:bg-fynlo-teal/90 transition-colors"
              >
                Go to sign in
              </button>
            </>
          )}

          {phase === 'ready' && (
            <>
              <h1 className="text-xl font-bold text-fynlo-dark mb-5">Choose a new password</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-fynlo-body mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-fynlo-dark text-sm focus:outline-none focus:ring-2 focus:ring-fynlo-teal/30 focus:border-fynlo-teal transition-colors"
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

                <div>
                  <label className="block text-sm font-semibold text-fynlo-body mb-1.5">Confirm password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Re-type the same password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-fynlo-dark text-sm focus:outline-none focus:ring-2 focus:ring-fynlo-teal/30 focus:border-fynlo-teal transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-fynlo-terra font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-fynlo-teal text-white font-bold py-3 rounded-btn text-sm hover:bg-fynlo-teal/90 transition-colors disabled:opacity-60 mt-2"
                >
                  {saving ? 'Saving…' : 'Set new password'}
                </button>
              </form>
            </>
          )}

          {phase === 'done' && (
            <>
              <h1 className="text-xl font-bold text-fynlo-dark mb-3">Password updated</h1>
              <p className="text-sm text-fynlo-body mb-5">
                You&apos;re all set. Redirecting to the dashboard…
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
