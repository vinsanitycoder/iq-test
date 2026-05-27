'use client'

import { useEffect, useState } from 'react'

/**
 * Banner shown at the top of the HR dashboard when the
 * "auto-send personality invite" toggle is ON. Reminds HR that
 * applicants will get invites automatically after completing the IQ test.
 *
 * Renders nothing when the toggle is off (or while loading), so it's
 * invisible unless HR has explicitly turned the feature on.
 */
export default function AutoInviteBanner() {
  const [show, setShow] = useState(false)
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/hr/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(({ settings }) => {
        if (cancelled) return
        if (settings?.auto_send_personality_invite) {
          setShow(true)
          if (typeof settings.auto_invite_deadline_days === 'number') {
            setDays(settings.auto_invite_deadline_days)
          }
        }
      })
      .catch(() => { /* silent — banner just doesn't appear */ })
    return () => { cancelled = true }
  }, [])

  if (!show) return null

  return (
    <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-sm text-fynlo-dark flex items-start gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-fynlo-teal shrink-0 mt-0.5"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <div className="flex-1">
        <span className="font-semibold">Auto-invite is on.</span>{' '}
        Applicants who complete the IQ test will automatically receive a personality test invite
        {days != null && (
          <> with a <strong>{days}-day</strong> deadline</>
        )}.
        {' '}
        <a href="/hr/settings" className="text-fynlo-teal font-semibold hover:underline">
          Change in Settings
        </a>
      </div>
    </div>
  )
}
