'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending',
  reviewed:       'Reviewed',
  shortlisted:    'Shortlisted',
  rejected:       'Rejected',
}

const STATUS_STYLES: Record<string, string> = {
  pending_review: 'bg-gray-100 text-gray-600 border-gray-200',
  reviewed:       'bg-blue-100 text-blue-700 border-blue-200',
  shortlisted:    'bg-lime-200 text-green-900 border-lime-300',
  rejected:       'bg-red-100 text-red-700 border-red-200',
}

type Props = {
  resultId: string
  currentStatus: string
  compact?: boolean
}

export default function StatusDropdown({ resultId, currentStatus, compact }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  async function handleChange(next: string) {
    if (next === status || saving) return
    setSaving(true)
    const prev = status
    setStatus(next) // optimistic

    const res = await fetch('/api/hr/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId, status: next }),
    })

    if (!res.ok) {
      setStatus(prev) // roll back
    } else {
      router.refresh()
    }
    setSaving(false)
  }

  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <select
      value={status}
      disabled={saving}
      onChange={e => handleChange(e.target.value)}
      onClick={e => e.stopPropagation()}
      className={`
        appearance-none cursor-pointer rounded-full border font-semibold
        transition-colors disabled:opacity-60
        ${compact ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'}
        ${style}
      `}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}
