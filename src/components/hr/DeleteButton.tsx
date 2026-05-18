'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  applicantId: string
  applicantName: string
}

export default function DeleteButton({ applicantId, applicantName }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch('/api/hr/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId }),
    })

    if (res.ok) {
      router.push('/hr')
      router.refresh()
    } else {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-sm text-red-800 flex-1">
          Delete <strong>{applicantName}</strong> and all their data permanently?
        </p>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="text-sm text-fynlo-subtle hover:text-fynlo-dark transition-colors px-3 py-1.5 disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors px-4 py-1.5 rounded-lg disabled:opacity-60"
        >
          {deleting ? 'Deleting…' : 'Yes, delete'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-600 hover:text-red-800 transition-colors underline-offset-2 hover:underline"
    >
      Delete applicant record
    </button>
  )
}
