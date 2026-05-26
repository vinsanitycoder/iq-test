'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PERSONALITY_QUESTIONS } from '@/lib/personality/questions'
import { getPageQuestions, getCurrentPage } from '@/lib/personality/shuffle'

const TOTAL_PAGES = 10
const DURATION_MS = 45 * 60 * 1000 // 45 minutes

interface SessionData {
  id: string
  status: string
  start_time: string
  tab_switches: number
}

export default function PersonalityTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<SessionData | null>(null)
  const [answeredIndexes, setAnsweredIndexes] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [pageAnswers, setPageAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoSubmitDoneRef = useRef(false)

  // Complete session and redirect — stable reference via useCallback
  const completeSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    await fetch('/api/personality/session/complete', { method: 'POST' })
    router.replace('/personality/complete')
  }, [router])

  // Load session on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/personality/session', { cache: 'no-store' })
        if (!res.ok) {
          router.replace('/personality/welcome')
          return
        }
        const data = await res.json()
        if (!data.session || data.session.status !== 'in_progress') {
          router.replace('/personality/welcome')
          return
        }
        const page = getCurrentPage(data.session.id, data.answeredIndexes ?? [])
        if (page >= TOTAL_PAGES) {
          // All questions already answered — finish up
          await fetch('/api/personality/session/complete', { method: 'POST' })
          router.replace('/personality/complete')
          return
        }
        setSession(data.session)
        setAnsweredIndexes(data.answeredIndexes ?? [])
        setCurrentPage(page)
      } catch {
        setError('Failed to load the test. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  // Countdown timer
  useEffect(() => {
    if (!session?.start_time) return
    const startMs = new Date(session.start_time).getTime()

    const tick = () => {
      const remaining = Math.max(0, DURATION_MS - (Date.now() - startMs))
      setRemainingSeconds(Math.ceil(remaining / 1000))
      if (remaining <= 0 && !autoSubmitDoneRef.current) {
        autoSubmitDoneRef.current = true
        // Only save completed pages — do not save current page's partial answers
        fetch('/api/personality/session/complete', { method: 'POST' })
          .finally(() => router.replace('/personality/complete'))
      }
    }

    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session?.start_time, router])

  // Tab-switch logging
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        fetch('/api/personality/session/tab-switch', { method: 'POST' }).catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  function handleAnswer(questionIndex: number, score: number) {
    setPageAnswers(prev => ({ ...prev, [questionIndex]: score }))
  }

  async function handleNextPage() {
    if (!session) return
    const pageQuestionIndexes = getPageQuestions(session.id, currentPage)
    const allAnswered = pageQuestionIndexes.every(idx => pageAnswers[idx] !== undefined)
    if (!allAnswered) return

    setSubmitting(true)
    setError(null)

    try {
      const answers = pageQuestionIndexes.map(idx => ({
        question_index: idx,
        raw_score: pageAnswers[idx],
      }))

      const res = await fetch('/api/personality/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
        cache: 'no-store',
      })

      if (!res.ok) {
        const body = await res.json()
        if (res.status === 409 && body.error === 'Time expired.') {
          await completeSession()
          return
        }
        setError('Failed to save your answers. Please try again.')
        setSubmitting(false)
        return
      }

      const newAnswered = [...answeredIndexes, ...pageQuestionIndexes]
      setAnsweredIndexes(newAnswered)
      setPageAnswers({})

      if (currentPage + 1 >= TOTAL_PAGES) {
        await completeSession()
        return
      }

      setCurrentPage(p => p + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F3] flex items-center justify-center font-nunito">
        <p className="text-[#4A6572]">Loading your assessment…</p>
      </main>
    )
  }

  if (!session) return null

  const pageQuestionIndexes = getPageQuestions(session.id, currentPage)
  const allAnswered = pageQuestionIndexes.every(idx => pageAnswers[idx] !== undefined)
  const isLastPage = currentPage === TOTAL_PAGES - 1
  const progressPct = Math.round((currentPage / TOTAL_PAGES) * 100)

  const mins = remainingSeconds !== null ? Math.floor(remainingSeconds / 60) : null
  const secs = remainingSeconds !== null ? remainingSeconds % 60 : null
  const timerWarning = remainingSeconds !== null && remainingSeconds < 300

  return (
    <main className="min-h-screen bg-[#F7F7F3] flex flex-col font-nunito">

      {/* Sticky header with timer */}
      <header className="bg-[#0084AD] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <p className="text-white font-semibold text-base">Personality Assessment</p>
        {mins !== null && secs !== null && (
          <p className={`font-mono font-bold text-base tabular-nums ${timerWarning ? 'text-red-300' : 'text-white'}`}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
        )}
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-[#4A6572] mb-1.5">
            <span>Page {currentPage + 1} of {TOTAL_PAGES}</span>
            <span>{progressPct}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0084AD] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {pageQuestionIndexes.map((qIdx, position) => {
            const q = PERSONALITY_QUESTIONS[qIdx]
            const selected = pageAnswers[qIdx]
            const questionNumber = currentPage * 10 + position + 1

            return (
              <div key={qIdx} className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                <p className="text-xs text-[#9aa5ad] uppercase tracking-wider mb-3">
                  Question {questionNumber}
                </p>

                {q.scenario && (
                  <p className="text-[#4A6572] italic text-sm mb-4 bg-[#F7F7F3] px-3 py-2 rounded-lg leading-relaxed">
                    {q.scenario}
                  </p>
                )}

                {/* Desktop: poles flanking the scale */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
                  <p className="text-[#4A6572] text-sm leading-snug text-right">
                    {q.leftPole}
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => handleAnswer(qIdx, score)}
                        className={`w-10 h-10 rounded-full font-bold text-sm border-2 transition-colors ${
                          selected === score
                            ? 'bg-[#0084AD] border-[#0084AD] text-white'
                            : 'border-gray-300 text-[#4A6572] hover:border-[#0084AD] hover:text-[#0084AD]'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <p className="text-[#4A6572] text-sm leading-snug text-left">
                    {q.rightPole}
                  </p>
                </div>

                {/* Mobile: stacked */}
                <div className="sm:hidden">
                  <p className="text-[#4A6572] text-sm leading-snug mb-3 font-medium">
                    {q.leftPole}
                  </p>
                  <div className="flex justify-center gap-3 mb-3">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => handleAnswer(qIdx, score)}
                        className={`w-11 h-11 rounded-full font-bold text-sm border-2 transition-colors ${
                          selected === score
                            ? 'bg-[#0084AD] border-[#0084AD] text-white'
                            : 'border-gray-300 text-[#4A6572]'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <p className="text-[#4A6572] text-sm leading-snug">{q.rightPole}</p>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                    <span>← A</span>
                    <span>B →</span>
                  </div>
                </div>
              </div>
            )
          })}

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            onClick={handleNextPage}
            disabled={!allAnswered || submitting}
            className="w-full bg-[#BC3F1D] hover:bg-[#a33518] text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : isLastPage ? 'Submit Assessment' : 'Next Page →'}
          </button>

          {!allAnswered && (
            <p className="text-xs text-center text-gray-400 pb-2">
              Answer all questions on this page to continue
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
