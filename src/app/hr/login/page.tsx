'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function HRLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
          <div className="text-fynlo-teal font-black text-3xl tracking-tight mb-1">Fynlo</div>
          <div className="text-fynlo-subtle text-sm">HR Portal</div>
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
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-fynlo-dark text-sm focus:outline-none focus:ring-2 focus:ring-fynlo-teal/30 focus:border-fynlo-teal transition-colors"
                placeholder="••••••••"
              />
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
          </form>
        </div>
      </div>
    </div>
  )
}
