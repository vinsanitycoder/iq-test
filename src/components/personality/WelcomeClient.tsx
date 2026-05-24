'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  firstName: string
  deadline: string
  hasStarted: boolean
}

export default function WelcomeClient({ firstName, deadline, hasStarted }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBegin() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/personality/session/begin', {
        method: 'POST',
        cache: 'no-store',
      })
      if (!res.ok) {
        const body = await res.json()
        if (res.status === 409) {
          router.push('/personality/complete')
          return
        }
        setError(body.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      router.push('/personality/test')
    } catch {
      setError('Connection error. Please check your internet and try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F3] flex flex-col font-[Nunito]">
      {/* Header */}
      <header className="bg-[#0084AD] px-6 py-4">
        <p className="text-white font-semibold text-base">HR Assessment Hub</p>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-md w-full max-w-xl p-8">
          <h1 className="text-2xl font-bold text-[#0084AD] mb-1">
            Personality Assessment
          </h1>
          <p className="text-[#4A6572] text-lg mb-6">
            Hi {firstName}!{hasStarted ? ' Welcome back.' : ''}
          </p>

          {/* Instructions */}
          <ul className="space-y-3 mb-6 text-[#4A6572]">
            {[
              <><strong>100 questions</strong> — takes about 30–45 minutes</>,
              <>There are <strong>no right or wrong answers</strong> — just be yourself</>,
              <>For each question, pick which statement fits you better on a 1–5 scale</>,
              <>You can pause and return on any device before the deadline</>,
              <>Tab switching is tracked during the assessment</>,
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#0084AD] mt-0.5 flex-shrink-0">✦</span>
                <p>{item}</p>
              </li>
            ))}
          </ul>

          {/* Deadline */}
          <div className="bg-[#F7F7F3] rounded-xl px-4 py-3 mb-6">
            <p className="text-[#4A6572] text-sm">
              <span className="font-semibold text-[#0084AD]">Deadline:</span>{' '}
              Complete by {deadline}
            </p>
          </div>

          {/* Resume notice */}
          {hasStarted && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-amber-700 text-sm">
                You&apos;ve already started. Your progress is saved — you&apos;ll
                continue from where you left off and your timer will pick up where it
                stopped.
              </p>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handleBegin}
            disabled={loading}
            className="w-full bg-[#BC3F1D] hover:bg-[#a33518] text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading…' : hasStarted ? 'Resume Test' : 'Begin Test'}
          </button>
        </div>
      </div>
    </main>
  )
}
