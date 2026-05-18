'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TestHeaderDynamic } from '@/components/TestHeaderDynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })
  const [errors, setErrors] = useState({ firstName: '', lastName: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e = { firstName: '', lastName: '', email: '' }
    if (!form.firstName.trim()) e.firstName = 'Please enter your first name.'
    if (!form.lastName.trim()) e.lastName = 'Please enter your last name.'
    if (!form.email.trim()) {
      e.email = 'Please enter your email address.'
    } else if (!EMAIL_RE.test(form.email.trim())) {
      e.email = 'Please enter a valid email address.'
    }
    setErrors(e)
    return !e.firstName && !e.lastName && !e.email
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError('')

    try {
      const res = await fetch('/api/applicant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError('Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      sessionStorage.setItem(
        'iq_session',
        JSON.stringify({ applicantId: data.applicantId, firstName: form.firstName.trim() })
      )

      router.push('/test/instructions')
    } catch {
      setServerError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  function field(
    id: keyof typeof form,
    label: string,
    type = 'text',
    autoComplete: string = id
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-semibold text-fynlo-body">
          {label}
        </label>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={form[id]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [id]: e.target.value }))
            setErrors((er) => ({ ...er, [id]: '' }))
          }}
          className={`w-full rounded-xl border px-4 py-3 text-fynlo-dark text-base outline-none transition-colors
            ${errors[id]
              ? 'border-red-400 focus:border-red-400'
              : 'border-[#D4E5EC] focus:border-fynlo-teal'
            }`}
        />
        {errors[id] && (
          <p className="text-xs text-red-500">{errors[id]}</p>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-fynlo-bg">
      <div className="mx-auto max-w-app">
        <TestHeaderDynamic />

        <div className="mx-4 -mt-4">
          <div className="bg-white rounded-card shadow-card p-5 pb-7">
            <h1 className="text-xl font-black text-fynlo-dark mb-1">
              Tell us a bit about yourself
            </h1>
            <p className="text-sm text-fynlo-body mb-5">
              We just need your name and email to get started.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {field('firstName', 'First name', 'text', 'given-name')}
              {field('lastName', 'Last name', 'text', 'family-name')}
              {field('email', 'Email address', 'email', 'email')}

              {serverError && (
                <p className="text-xs text-red-500 text-center">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full bg-fynlo-terra text-white text-base font-black py-4 rounded-btn hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? 'Please wait…' : 'Continue'}
              </button>

              <p className="text-xs text-fynlo-subtle text-center">
                Your information is kept private and only used for this application.
              </p>
            </form>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </main>
  )
}
