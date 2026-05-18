'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import StatusDropdown from './StatusDropdown'
import RowDeleteButton from './RowDeleteButton'

type DashboardRow = {
  id: string
  iq_score: number
  iq_label: string
  percentile: number
  status: string
  created_at: string
  applicants: { id: string; first_name: string; last_name: string; email: string } | null
  test_sessions: { time_taken_seconds: number | null; tab_switches: number } | null
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending',
  reviewed:       'Reviewed',
  shortlisted:    'Shortlisted',
  rejected:       'Rejected',
}

const IQ_LABEL_STYLES: Record<string, string> = {
  'Superior':      'bg-purple-100 text-purple-800',
  'Above Average': 'bg-teal-100 text-teal-800',
  'High Average':  'bg-green-100 text-green-800',
  'Average':       'bg-yellow-100 text-yellow-800',
  'Low Average':   'bg-orange-100 text-orange-800',
  'Below Average': 'bg-red-100 text-red-800',
}

function formatTime(seconds: number | null) {
  if (seconds == null) return '—'
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

export default function DashboardTable() {
  const [results, setResults] = useState<DashboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState('')
  const [applyingStatus, setApplyingStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/hr/results')
      const json = await res.json()
      setResults(json.results ?? [])
    } catch {
      // keep existing data on network error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Drive the indeterminate state of the select-all checkbox
  useEffect(() => {
    if (!selectAllRef.current) return
    const all = results.length > 0 && selected.size === results.length
    const some = selected.size > 0 && selected.size < results.length
    selectAllRef.current.checked = all
    selectAllRef.current.indeterminate = some
  }, [selected, results])

  function toggleAll() {
    if (selected.size === results.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(results.map(r => r.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
    setBulkStatus('')
  }

  async function handleBulkStatus() {
    if (!bulkStatus || applyingStatus) return
    setApplyingStatus(true)
    try {
      await fetch('/api/hr/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultIds: [...selected], status: bulkStatus }),
      })
      clearSelection()
      await load()
    } catch {
      // silent — data unchanged
    } finally {
      setApplyingStatus(false)
    }
  }

  async function handleBulkDelete() {
    setDeleting(true)
    try {
      const applicantIds = results
        .filter(r => selected.has(r.id) && r.applicants?.id)
        .map(r => r.applicants!.id)
      await fetch('/api/hr/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantIds }),
      })
      clearSelection()
      await load()
    } catch {
      // silent
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const selectedCount = selected.size
  const selectedNames = results
    .filter(r => selected.has(r.id))
    .map(r => r.applicants ? `${r.applicants.first_name} ${r.applicants.last_name}` : 'Unknown')

  if (loading) {
    return <div className="py-16 text-center text-fynlo-subtle text-sm">Loading…</div>
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card px-8 py-16 text-center">
        <p className="text-fynlo-subtle text-sm">No submissions yet.</p>
      </div>
    )
  }

  return (
    <>
      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 bg-fynlo-dark text-white px-4 py-3 rounded-xl">
          <span className="text-sm font-semibold whitespace-nowrap">
            {selectedCount} selected
          </span>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value)}
              disabled={applyingStatus}
              className="text-xs rounded-lg px-2.5 py-1.5 border border-white/20 bg-white/10 text-white disabled:opacity-50 cursor-pointer"
            >
              <option value="">Change status…</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <button
              onClick={handleBulkStatus}
              disabled={!bulkStatus || applyingStatus}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              {applyingStatus ? 'Applying…' : 'Apply'}
            </button>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            Delete selected
          </button>

          <button
            onClick={clearSelection}
            title="Clear selection"
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-8">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-fynlo-teal cursor-pointer accent-fynlo-teal"
                  />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide w-full">
                  Applicant
                </th>
                <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide">
                  IQ
                </th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden sm:table-cell">
                  Label
                </th>
                <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden md:table-cell">
                  Percentile
                </th>
                <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden lg:table-cell">
                  Time
                </th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden md:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map(row => {
                const applicant = row.applicants
                const name = applicant ? `${applicant.first_name} ${applicant.last_name}` : 'Unknown'
                const email = applicant?.email ?? '—'
                const labelStyle = IQ_LABEL_STYLES[row.iq_label] ?? 'bg-gray-100 text-gray-700'
                const isSelected = selected.has(row.id)

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${isSelected ? 'bg-teal-50' : 'hover:bg-fynlo-bg/60'}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(row.id)}
                        className="rounded border-gray-300 cursor-pointer accent-fynlo-teal"
                      />
                    </td>
                    <td className="px-4 py-3 max-w-0 w-full">
                      <Link href={`/hr/applicant/${row.id}`} className="group">
                        <div className="font-semibold text-fynlo-dark group-hover:text-fynlo-teal transition-colors truncate">
                          {name}
                        </div>
                        <div className="text-fynlo-subtle text-xs mt-0.5 truncate">{email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-fynlo-dark text-base">{row.iq_score}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${labelStyle}`}>
                        {row.iq_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-fynlo-body hidden md:table-cell">
                      {ordinal(row.percentile)}
                    </td>
                    <td className="px-4 py-3 text-center text-fynlo-body hidden lg:table-cell">
                      {formatTime(row.test_sessions?.time_taken_seconds ?? null)}
                    </td>
                    <td className="px-4 py-3 text-fynlo-subtle hidden md:table-cell">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDropdown
                        resultId={row.id}
                        currentStatus={row.status}
                        compact
                        onUpdate={load}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <RowDeleteButton
                        applicantId={applicant?.id ?? ''}
                        applicantName={name}
                        onDelete={load}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget && !deleting) setShowDeleteModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-black text-fynlo-dark mb-2">
              Delete {selectedCount} {selectedCount === 1 ? 'applicant' : 'applicants'}?
            </h2>
            <p className="text-sm text-fynlo-body mb-3">
              This will permanently delete the following and all their test data:
            </p>
            <ul className="text-sm font-semibold text-fynlo-dark mb-6 space-y-1 max-h-40 overflow-y-auto">
              {selectedNames.map((n, i) => <li key={i}>· {n}</li>)}
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, delete all'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
