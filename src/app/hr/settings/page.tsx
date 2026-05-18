'use client'

import { useState, useEffect, useRef } from 'react'
import HRNav from '@/components/hr/HRNav'
import Link from 'next/link'

const LIMITS = {
  company_name: 60,
  test_name: 80,
  welcome_headline: 100,
  welcome_body: 500,
  completion_message: 500,
  confidentiality_text: 500,
  whats_next_text: 500,
}

type Fields = {
  company_name: string
  test_name: string
  welcome_headline: string
  welcome_body: string
  completion_message: string
  confidentiality_text: string
  whats_next_text: string
}

const EMPTY: Fields = {
  company_name: '',
  test_name: '',
  welcome_headline: '',
  welcome_body: '',
  completion_message: '',
  confidentiality_text: '',
  whats_next_text: '',
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const remaining = max - value.length
  const near = remaining <= Math.ceil(max * 0.1)
  return (
    <span className={`text-xs tabular-nums ${near ? 'text-fynlo-terra font-semibold' : 'text-fynlo-subtle'}`}>
      {remaining} left
    </span>
  )
}

export default function SettingsPage() {
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)
  const [logoMsg, setLogoMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [removingLogo, setRemovingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/hr/settings')
      .then(r => r.json())
      .then(({ settings }) => {
        if (settings) {
          setFields({
            company_name: settings.company_name ?? '',
            test_name: settings.test_name ?? '',
            welcome_headline: settings.welcome_headline ?? '',
            welcome_body: settings.welcome_body ?? '',
            completion_message: settings.completion_message ?? '',
            confidentiality_text: settings.confidentiality_text ?? '',
            whats_next_text: settings.whats_next_text ?? '',
          })
          setLogoUrl(settings.company_logo_url ?? null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  function set(key: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const max = LIMITS[key]
      setFields(f => ({ ...f, [key]: e.target.value.slice(0, max) }))
      setSaveMsg(null)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch('/api/hr/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const json = await res.json()
      if (!res.ok) {
        setSaveMsg({ ok: false, text: json.error ?? 'Something went wrong.' })
      } else {
        setSaveMsg({ ok: true, text: 'Settings saved.' })
      }
    } catch {
      setSaveMsg({ ok: false, text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveLogo() {
    setRemovingLogo(true)
    setLogoMsg(null)
    try {
      const res = await fetch('/api/hr/settings/logo', { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        setLogoMsg({ ok: false, text: json.error ?? 'Could not remove logo.' })
      } else {
        setLogoUrl(null)
        setLogoMsg({ ok: true, text: 'Logo removed.' })
      }
    } catch {
      setLogoMsg({ ok: false, text: 'Network error. Please try again.' })
    } finally {
      setRemovingLogo(false)
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoLoading(true)
    setLogoMsg(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/hr/settings/logo', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) {
        setLogoMsg({ ok: false, text: json.error ?? 'Upload failed.' })
      } else {
        setLogoUrl(json.url)
        setLogoMsg({ ok: true, text: 'Logo uploaded.' })
      }
    } catch {
      setLogoMsg({ ok: false, text: 'Network error. Please try again.' })
    } finally {
      setLogoLoading(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <>
        <HRNav />
        <div className="px-4 py-10 text-center text-fynlo-subtle text-sm">Loading…</div>
      </>
    )
  }

  return (
    <>
      <HRNav />

      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/hr"
            className="text-fynlo-subtle text-sm hover:text-fynlo-teal transition-colors"
          >
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-black text-fynlo-dark mt-3">Settings</h1>
          <p className="text-fynlo-subtle text-sm mt-1">
            Changes to company name, logo, test name, and welcome text appear immediately on the applicant screen.
          </p>
        </div>

        {/* Logo upload */}
        <div className="bg-white rounded-card shadow-card p-5 mb-5">
          <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-4">
            Company Logo
          </h2>

          {logoUrl && (
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Company logo"
                className="h-16 w-auto object-contain rounded-lg border border-gray-100 mb-3"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={removingLogo}
                className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors disabled:opacity-50"
              >
                {removingLogo ? 'Removing…' : 'Remove logo'}
              </button>
            </div>
          )}

          <label className="block text-sm font-semibold text-fynlo-dark mb-2">
            {logoUrl ? 'Replace logo' : 'Upload logo'}
          </label>
          <p className="text-xs text-fynlo-subtle mb-3">JPG, PNG, or SVG · max 2 MB</p>

          <input
            ref={logoInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
            onChange={handleLogoChange}
            disabled={logoLoading}
            className="block w-full text-sm text-fynlo-body
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-fynlo-bg file:text-fynlo-dark
              hover:file:bg-gray-200
              file:cursor-pointer cursor-pointer
              disabled:opacity-50"
          />

          {logoLoading && (
            <p className="text-xs text-fynlo-subtle mt-2">Uploading…</p>
          )}
          {logoMsg && (
            <p className={`text-xs mt-2 font-semibold ${logoMsg.ok ? 'text-green-700' : 'text-red-600'}`}>
              {logoMsg.text}
            </p>
          )}
        </div>

        {/* Text fields */}
        <form onSubmit={handleSave}>
          {/* Branding */}
          <div className="bg-white rounded-card shadow-card p-5 mb-5 space-y-5">
            <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide">
              Branding
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-fynlo-dark">Company Name</label>
                <CharCounter value={fields.company_name} max={LIMITS.company_name} />
              </div>
              <input
                type="text"
                value={fields.company_name}
                onChange={set('company_name')}
                maxLength={LIMITS.company_name}
                required
                placeholder="e.g. Fynlo"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-fynlo-dark placeholder:text-fynlo-subtle focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 focus:border-fynlo-teal"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-fynlo-dark">Test Name</label>
                <CharCounter value={fields.test_name} max={LIMITS.test_name} />
              </div>
              <input
                type="text"
                value={fields.test_name}
                onChange={set('test_name')}
                maxLength={LIMITS.test_name}
                placeholder="Applicant Logical Test"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-fynlo-dark placeholder:text-fynlo-subtle focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 focus:border-fynlo-teal"
              />
            </div>
          </div>

          {/* Welcome screen */}
          <div className="bg-white rounded-card shadow-card p-5 mb-5 space-y-5">
            <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide">
              Welcome Screen
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-fynlo-dark">Headline</label>
                <CharCounter value={fields.welcome_headline} max={LIMITS.welcome_headline} />
              </div>
              <input
                type="text"
                value={fields.welcome_headline}
                onChange={set('welcome_headline')}
                maxLength={LIMITS.welcome_headline}
                placeholder="Ready to show what you can do?"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-fynlo-dark placeholder:text-fynlo-subtle focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 focus:border-fynlo-teal"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-fynlo-dark">Body Text</label>
                <CharCounter value={fields.welcome_body} max={LIMITS.welcome_body} />
              </div>
              <textarea
                value={fields.welcome_body}
                onChange={set('welcome_body')}
                maxLength={LIMITS.welcome_body}
                rows={4}
                placeholder="This short test helps us understand how you approach problems…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-fynlo-dark placeholder:text-fynlo-subtle focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 focus:border-fynlo-teal resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Completion screen */}
          <div className="bg-white rounded-card shadow-card p-5 mb-5 space-y-5">
            <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide">
              Completion Screen
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-fynlo-dark">Thank You Message</label>
                <CharCounter value={fields.completion_message} max={LIMITS.completion_message} />
              </div>
              <textarea
                value={fields.completion_message}
                onChange={set('completion_message')}
                maxLength={LIMITS.completion_message}
                rows={3}
                placeholder="Thank you for completing the test. We'll be in touch soon."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-fynlo-dark placeholder:text-fynlo-subtle focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 focus:border-fynlo-teal resize-none leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-fynlo-dark">Confidentiality Statement</label>
                <CharCounter value={fields.confidentiality_text} max={LIMITS.confidentiality_text} />
              </div>
              <textarea
                value={fields.confidentiality_text}
                onChange={set('confidentiality_text')}
                maxLength={LIMITS.confidentiality_text}
                rows={3}
                placeholder="Your results are kept strictly confidential…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-fynlo-dark placeholder:text-fynlo-subtle focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 focus:border-fynlo-teal resize-none leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-fynlo-dark">What Happens Next</label>
                <CharCounter value={fields.whats_next_text} max={LIMITS.whats_next_text} />
              </div>
              <textarea
                value={fields.whats_next_text}
                onChange={set('whats_next_text')}
                maxLength={LIMITS.whats_next_text}
                rows={3}
                placeholder="Our team will review your results and reach out within a few days."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-fynlo-dark placeholder:text-fynlo-subtle focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 focus:border-fynlo-teal resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#BC3F1D' }}
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>

          {saveMsg && (
            <p className={`text-sm text-center mt-3 font-semibold ${saveMsg.ok ? 'text-green-700' : 'text-red-600'}`}>
              {saveMsg.text}
            </p>
          )}
        </form>

        <div className="h-8" />
      </div>
    </>
  )
}
