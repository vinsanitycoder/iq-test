'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RowDeleteButton({ applicantId, applicantName }: { applicantId: string; applicantName: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleClick() {
    if (!window.confirm(`Delete ${applicantName} and all their data permanently? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch('/api/hr/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={deleting}
      title="Delete applicant"
      className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
    >
      {deleting ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  )
}
