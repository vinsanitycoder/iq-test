'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TestHeaderDynamic } from '@/components/TestHeaderDynamic'

const RULES = [
  {
    heading: '40 questions, 5 types of reasoning',
    detail: 'Pattern recognition, numerical, verbal, deductive, and logical sequences.',
  },
  {
    heading: '25 minutes total',
    detail: 'The countdown starts the moment the real test begins.',
  },
  {
    heading: 'You can skip, but not go back',
    detail: 'Move forward freely — revisiting earlier questions is not possible.',
  },
  {
    heading: 'Unanswered questions score zero',
    detail: 'A guess is always better than a blank.',
  },
  {
    heading: 'Keep this window open and focused',
    detail: 'Tab switches are logged automatically.',
  },
]

export default function InstructionsPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('iq_session')
    if (!raw) {
      router.replace('/test')
      return
    }
    try {
      const session = JSON.parse(raw) as { applicantId: string; firstName: string }
      setFirstName(session.firstName)
      setReady(true)
    } catch {
      router.replace('/test')
    }
  }, [router])

  async function startRealTest() {
    const raw = sessionStorage.getItem('iq_session')
    if (!raw) { router.replace('/test'); return }
    const { applicantId } = JSON.parse(raw) as { applicantId: string }
    setStarting(true)
    setStartError('')
    try {
      const res = await fetch('/api/test/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStartError('Could not start the test. Please try again.')
        setStarting(false)
        return
      }
      sessionStorage.setItem(
        'iq_test_session',
        JSON.stringify({ sessionId: data.sessionId, startTime: data.startTime, questions: data.questions })
      )
      router.push(`/test/questions/${data.sessionId}`)
    } catch {
      setStartError('Could not start the test. Please try again.')
      setStarting(false)
    }
  }

  if (!ready) return null

  return (
    <main className="min-h-screen bg-fynlo-bg">
      <div className="mx-auto max-w-app">
        <TestHeaderDynamic />

        <div className="mx-4 -mt-4">
          <div className="bg-white rounded-card shadow-card p-5 pb-7">
            <h1 className="text-xl font-black text-fynlo-dark mb-1">
              {firstName ? `Good luck, ${firstName}!` : 'Before you begin'}
            </h1>
            <p className="text-sm text-fynlo-body mb-5">
              Here are a few things to know before you start.
            </p>

            {/* Rules list */}
            <div className="flex flex-col gap-3 mb-7">
              {RULES.map((rule, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-fynlo-teal flex items-center justify-center">
                    <span className="text-white text-[10px] font-black">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-fynlo-dark leading-snug">
                      {rule.heading}
                    </p>
                    <p className="text-xs text-fynlo-body mt-0.5 leading-relaxed">
                      {rule.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-[#E8F1F5] mb-5" />

            {/* Practice tip */}
            <div className="bg-fynlo-statbg rounded-xl px-4 py-3 mb-6">
              <p className="text-xs font-bold text-fynlo-dark mb-0.5">Try the practice round first</p>
              <p className="text-xs text-fynlo-body leading-relaxed">
                Five short unscored questions — one per question type. The timer does not run during practice.
              </p>
            </div>

            {/* CTAs */}
            <Link
              href="/test/practice"
              className="block w-full bg-fynlo-terra text-white text-center text-base font-black py-4 rounded-btn hover:opacity-90 transition-opacity mb-3"
            >
              Start Practice Questions
            </Link>

            {startError && (
              <p className="text-xs text-red-500 text-center mb-2">{startError}</p>
            )}

            <div className="text-center">
              <button
                onClick={startRealTest}
                disabled={starting}
                className="text-sm font-bold text-fynlo-teal hover:underline disabled:opacity-60"
              >
                {starting ? 'Starting…' : 'Skip to Real Test'}
              </button>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </main>
  )
}
