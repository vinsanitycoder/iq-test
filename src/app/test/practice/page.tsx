'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TestHeaderDynamic } from '@/components/TestHeaderDynamic'
import type { QuestionType } from '@/types/database'

interface PracticeQuestion {
  id: string
  type: QuestionType
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  svg_content: string | null
}

const TYPE_LABELS: Record<QuestionType, string> = {
  pattern_recognition: 'Pattern Recognition',
  numerical: 'Numerical Reasoning',
  verbal_analogy: 'Verbal Reasoning',
  deductive: 'Deductive Reasoning',
  logical_sequence: 'Logical Sequence',
}

const OPTIONS: { key: keyof PracticeQuestion; label: string }[] = [
  { key: 'option_a', label: 'A' },
  { key: 'option_b', label: 'B' },
  { key: 'option_c', label: 'C' },
  { key: 'option_d', label: 'D' },
]

export default function PracticePage() {
  const router = useRouter()

  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  // Guard: must have a registered session
  useEffect(() => {
    const raw = sessionStorage.getItem('iq_session')
    if (!raw) {
      router.replace('/test')
      return
    }
    try {
      JSON.parse(raw) // validate JSON
    } catch {
      router.replace('/test')
      return
    }

    fetch('/api/practice-questions')
      .then((res) => res.json())
      .then((body: { questions?: PracticeQuestion[]; error?: string }) => {
        if (!body.questions?.length) {
          setFetchError(true)
        } else {
          setQuestions(body.questions)
        }
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
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

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
    } else {
      startRealTest()
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-fynlo-bg">
        <div className="mx-auto max-w-app">
          <TestHeaderDynamic />
          <div className="mx-4 -mt-4">
            <div className="bg-white rounded-card shadow-card p-5 pb-7 flex items-center justify-center min-h-[220px]">
              <p className="text-fynlo-subtle text-sm font-semibold">Loading questions…</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (fetchError || !questions.length) {
    return (
      <main className="min-h-screen bg-fynlo-bg">
        <div className="mx-auto max-w-app">
          <TestHeaderDynamic />
          <div className="mx-4 -mt-4">
            <div className="bg-white rounded-card shadow-card p-5 pb-7 text-center">
              <p className="text-fynlo-dark font-bold mb-2">Practice questions unavailable</p>
              <p className="text-fynlo-body text-sm mb-5">
                You can skip straight to the real test.
              </p>
              <button
                onClick={startRealTest}
                disabled={starting}
                className="w-full bg-fynlo-terra text-white text-base font-black py-4 rounded-btn hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {starting ? 'Starting…' : 'Begin Real Test'}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Question screen ──────────────────────────────────────────────────
  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const total = questions.length

  return (
    <main className="min-h-screen bg-fynlo-bg">
      <div className="mx-auto max-w-app">
        <TestHeaderDynamic />

        <div className="mx-4 -mt-4 pb-6">
          <div className="bg-white rounded-card shadow-card p-5">

            {/* Progress row */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-fynlo-subtle">
                Practice {currentIndex + 1} of {total}
              </p>
              <span className="bg-fynlo-lime text-fynlo-dark text-[10px] font-black px-3 py-0.5 rounded-full">
                UNSCORED
              </span>
            </div>

            {/* Type badge */}
            <div className="mb-4">
              <span className="text-xs font-bold text-fynlo-teal uppercase tracking-wide">
                {TYPE_LABELS[question.type]}
              </span>
            </div>

            {/* SVG visual (if present) */}
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

            {/* Options */}
            <div className="flex flex-col gap-2.5 mb-6">
              {OPTIONS.map(({ key, label }) => {
                const text = question[key] as string
                const isSelected = selected === label

                return (
                  <button
                    key={label}
                    onClick={() => setSelected(label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors
                      ${isSelected
                        ? 'border-fynlo-teal bg-[#E8F5FA]'
                        : 'border-[#D4E5EC] bg-white hover:border-fynlo-teal/50'
                      }`}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors
                        ${isSelected
                          ? 'bg-fynlo-teal text-white'
                          : 'bg-fynlo-statbg text-fynlo-subtle'
                        }`}
                    >
                      {label}
                    </span>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-fynlo-dark' : 'text-fynlo-body'}`}>
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* CTA */}
            <button
              onClick={handleNext}
              disabled={starting}
              className="w-full bg-fynlo-terra text-white text-base font-black py-4 rounded-btn hover:opacity-90 transition-opacity disabled:opacity-60 mb-3"
            >
              {starting ? 'Starting…' : isLast ? 'Begin Real Test' : 'Next Question'}
            </button>

            {startError && (
              <p className="text-xs text-red-500 text-center mb-2">{startError}</p>
            )}

            {/* Skip link */}
            <div className="text-center">
              <button
                onClick={startRealTest}
                disabled={starting}
                className="text-sm font-bold text-fynlo-teal hover:underline disabled:opacity-60"
              >
                Skip to Real Test
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
