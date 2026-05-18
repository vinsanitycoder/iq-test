'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TestHeaderDynamic } from '@/components/TestHeaderDynamic'
import type { QuestionForClient, QuestionType } from '@/types/database'

const TEST_DURATION = 25 * 60

const TYPE_LABELS: Record<QuestionType, string> = {
  pattern_recognition: 'Pattern Recognition',
  numerical: 'Numerical Reasoning',
  verbal_analogy: 'Verbal Reasoning',
  deductive: 'Deductive Reasoning',
  logical_sequence: 'Logical Sequence',
}

const OPTIONS = ['A', 'B', 'C', 'D'] as const
type OptionKey = 'option_a' | 'option_b' | 'option_c' | 'option_d'
const OPTION_KEYS: OptionKey[] = ['option_a', 'option_b', 'option_c', 'option_d']

interface StoredTestSession {
  sessionId: string
  startTime: string
  questions: QuestionForClient[]
}

export default function QuestionsPage() {
  const router = useRouter()
  const { sessionId } = useParams<{ sessionId: string }>()

  const [questions, setQuestions] = useState<QuestionForClient[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION)
  const [saving, setSaving] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [ready, setReady] = useState(false)

  // Refs prevent stale closures in timer callbacks without re-running effects
  const questionsRef = useRef<QuestionForClient[]>([])
  const currentIndexRef = useRef(0)
  const selectedRef = useRef<string | null>(null)
  const autoSubmittedRef = useRef(false)

  useEffect(() => { questionsRef.current = questions }, [questions])
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { selectedRef.current = selected }, [selected])

  const fetchTimeRemaining = useCallback(async (): Promise<{ secondsRemaining: number; status: string } | null> => {
    try {
      const res = await fetch(`/api/test/time-remaining?sessionId=${encodeURIComponent(sessionId)}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }, [sessionId])

  // finishTest reads from refs — stable deps, safe to call from any timer callback
  const finishTest = useCallback(async (expired: boolean) => {
    if (autoSubmittedRef.current) return
    autoSubmittedRef.current = true
    setFinishing(true)

    const question = questionsRef.current[currentIndexRef.current]
    if (question) {
      await fetch('/api/test/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: question.id,
          selectedAnswer: selectedRef.current,
        }),
      }).catch(() => {})
    }

    await fetch('/api/test/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, expired }),
    }).catch(() => {})

    router.push('/test/complete')
  }, [sessionId, router])

  // On mount: validate sessionStorage then fetch authoritative time from server
  useEffect(() => {
    const raw = sessionStorage.getItem('iq_test_session')
    if (!raw) {
      router.replace('/test')
      return
    }

    let parsed: StoredTestSession
    try {
      parsed = JSON.parse(raw) as StoredTestSession
      if (parsed.sessionId !== sessionId || !parsed.questions?.length) {
        router.replace('/test')
        return
      }
    } catch {
      router.replace('/test')
      return
    }

    setQuestions(parsed.questions)
    questionsRef.current = parsed.questions

    fetchTimeRemaining().then((result) => {
      if (!result) {
        // Network error — fall back to stored start time
        const elapsed = Math.floor(
          (Date.now() - new Date(parsed.startTime).getTime()) / 1000
        )
        const fallback = Math.max(0, TEST_DURATION - elapsed)
        if (fallback === 0) {
          finishTest(true)
        } else {
          setTimeLeft(fallback)
          setReady(true)
        }
        return
      }
      if (result.secondsRemaining === 0) {
        finishTest(true)
        return
      }
      setTimeLeft(result.secondsRemaining)
      setReady(true)
    })
  }, [sessionId, router, fetchTimeRemaining, finishTest])

  // Countdown — one second tick
  useEffect(() => {
    if (!ready) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [ready])

  // Auto-submit when countdown reaches zero
  useEffect(() => {
    if (timeLeft === 0 && ready && !autoSubmittedRef.current) {
      finishTest(true)
    }
  }, [timeLeft, ready, finishTest])

  // Periodic server sync every 60s + immediately on tab becoming visible
  // Catches browser throttling in background tabs
  useEffect(() => {
    if (!ready) return

    const sync = async () => {
      if (autoSubmittedRef.current) return
      const result = await fetchTimeRemaining()
      if (!result) return
      if (result.secondsRemaining === 0) {
        finishTest(true)
        return
      }
      // Only jump the display if drift exceeds 3s to avoid visible jitter
      setTimeLeft((prev) =>
        Math.abs(prev - result.secondsRemaining) > 3 ? result.secondsRemaining : prev
      )
    }

    const interval = setInterval(sync, 60_000)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        fetch('/api/test/tab-switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {})
      } else {
        sync()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [ready, fetchTimeRemaining, finishTest])

  async function handleNext(skip: boolean) {
    if (saving || finishing) return
    setSaving(true)

    const question = questions[currentIndex]
    const answerToSave = skip ? null : selected

    await fetch('/api/test/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        questionId: question.id,
        selectedAnswer: answerToSave,
      }),
    }).catch(() => {})

    if (currentIndex === questions.length - 1) {
      autoSubmittedRef.current = true
      await fetch('/api/test/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, expired: false }),
      }).catch(() => {})
      setFinishing(true)
      router.push('/test/complete')
      return
    }

    setCurrentIndex((i) => i + 1)
    setSelected(null)
    setSaving(false)
  }

  // ── Loading / submitting state ────────────────────────────────────────
  if (!ready || finishing) {
    return (
      <main className="min-h-screen bg-fynlo-bg">
        <div className="mx-auto max-w-app">
          <TestHeaderDynamic />
          <div className="mx-4 -mt-4">
            <div className="bg-white rounded-card shadow-card p-5 min-h-[220px] flex items-center justify-center">
              <p className="text-fynlo-subtle text-sm font-semibold">
                {finishing ? 'Submitting your test…' : 'Loading…'}
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!questions.length) return null

  const question = questions[currentIndex]
  const total = questions.length
  const progress = ((currentIndex + 1) / total) * 100
  const isLast = currentIndex === total - 1

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const timerLow = timeLeft < 60

  return (
    <main className="min-h-screen bg-fynlo-bg">
      <div className="mx-auto max-w-app">
        <TestHeaderDynamic />

        <div className="mx-4 -mt-4 pb-6">
          <div className="bg-white rounded-card shadow-card p-5">

            {/* Progress row */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-fynlo-subtle">
                Question {currentIndex + 1} of {total}
              </p>
              <span
                className={`text-sm font-black tabular-nums ${
                  timerLow ? 'text-fynlo-terra' : 'text-fynlo-teal'
                }`}
              >
                {timerStr}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#E8F1F5] rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-fynlo-teal rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Type badge */}
            <div className="mb-4">
              <span className="text-xs font-bold text-fynlo-teal uppercase tracking-wide">
                {TYPE_LABELS[question.type]}
              </span>
            </div>

            {/* SVG visual */}
            {question.svg_content && (
              <div
                className="w-full bg-fynlo-statbg rounded-xl p-4 mb-4 flex items-center justify-center overflow-hidden [&_svg]:max-w-full [&_svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: question.svg_content }}
              />
            )}

            {/* Question text */}
            <p className="text-base font-bold text-fynlo-dark leading-snug mb-5 whitespace-pre-line">
              {question.question_text}
            </p>

            {/* Answer options */}
            <div className="flex flex-col gap-2.5 mb-6">
              {OPTIONS.map((label, i) => {
                const key = OPTION_KEYS[i]
                const text = question[key] as string
                const isSelected = selected === label.toLowerCase()

                return (
                  <button
                    key={label}
                    onClick={() => setSelected(label.toLowerCase())}
                    disabled={saving}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors
                      ${
                        isSelected
                          ? 'border-fynlo-teal bg-[#E8F5FA]'
                          : 'border-[#D4E5EC] bg-white hover:border-fynlo-teal/50'
                      }`}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors
                        ${isSelected ? 'bg-fynlo-teal text-white' : 'bg-fynlo-statbg text-fynlo-subtle'}`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-sm font-semibold ${isSelected ? 'text-fynlo-dark' : 'text-fynlo-body'}`}
                    >
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Next button — requires a selection */}
            <button
              onClick={() => handleNext(false)}
              disabled={saving || !selected}
              className="w-full bg-fynlo-terra text-white text-base font-black py-4 rounded-btn hover:opacity-90 transition-opacity disabled:opacity-50 mb-3"
            >
              {saving ? 'Saving…' : isLast ? 'Submit Test' : 'Next Question'}
            </button>

            {/* Skip */}
            <div className="text-center">
              <button
                onClick={() => handleNext(true)}
                disabled={saving}
                className="text-sm font-bold text-fynlo-subtle hover:text-fynlo-body transition-colors disabled:opacity-50"
              >
                Skip this question →
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
