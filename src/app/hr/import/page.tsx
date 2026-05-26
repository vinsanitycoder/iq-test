'use client'

import { useState, useRef } from 'react'
import HRNav from '@/components/hr/HRNav'
import Link from 'next/link'

type InsertResult = { imported: number; errors: string[] }
type UpdateResult = { updated: number; notFound: number; errors: string[] }
type Result = InsertResult | UpdateResult

function isUpdateResult(r: Result): r is UpdateResult {
  return 'updated' in r
}

export default function ImportPage() {
  const [mode, setMode] = useState<'insert' | 'update'>('insert')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function switchMode(next: 'insert' | 'update') {
    setMode(next)
    setFile(null)
    setResult(null)
    setErrorMsg(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    try {
      const res = await fetch('/api/hr/import', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.')
      } else {
        setResult(json as Result)
        setFile(null)
        if (inputRef.current) inputRef.current.value = ''
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <HRNav />

      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/hr" className="text-fynlo-subtle text-sm hover:text-fynlo-teal transition-colors">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-black text-fynlo-dark mt-3">Import / Update Applicants</h1>
          <p className="text-fynlo-subtle text-sm mt-1">
            Add new applicants from a CSV, or update details for existing ones.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => switchMode('insert')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              mode === 'insert'
                ? 'border-fynlo-teal bg-fynlo-teal text-white'
                : 'border-gray-200 bg-white text-fynlo-body hover:bg-gray-50'
            }`}
          >
            Add new applicants
          </button>
          <button
            onClick={() => switchMode('update')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              mode === 'update'
                ? 'border-fynlo-teal bg-fynlo-teal text-white'
                : 'border-gray-200 bg-white text-fynlo-body hover:bg-gray-50'
            }`}
          >
            Update existing
          </button>
        </div>

        {/* Column info */}
        {mode === 'insert' ? (
          <div className="bg-white rounded-card shadow-card p-5 mb-5 space-y-4">
            <div>
              <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-3">Required columns</h2>
              <div className="flex flex-wrap gap-2">
                {['First Name', 'Last Name', 'Email'].map(col => (
                  <span key={col} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D4FF98', color: '#003B4C' }}>
                    {col}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-3">Optional columns</h2>
              <div className="flex flex-wrap gap-2">
                {['Role Applied For', 'Resume URL', 'Interview Video URL'].map(col => (
                  <span key={col} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{col}</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-fynlo-subtle leading-relaxed">
              Column names are matched flexibly — &quot;First Name&quot;, &quot;first_name&quot;, and &quot;firstname&quot; all work. URLs must start with http:// or https://. Any other columns are ignored.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card p-5 mb-5 space-y-4">
            <div>
              <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-3">Required column</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D4FF98', color: '#003B4C' }}>
                  Email
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-3">Columns to update</h2>
              <div className="flex flex-wrap gap-2">
                {['Role Applied For', 'Resume URL', 'Interview Video URL'].map(col => (
                  <span key={col} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{col}</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-fynlo-subtle leading-relaxed">
              Matches applicants by email address and updates whichever columns are present in the file. Only columns you include are changed — others are left as-is. If multiple applicants share the same email, all are updated. URLs must start with http:// or https://.
            </p>
          </div>
        )}

        {/* Upload form */}
        <div className="bg-white rounded-card shadow-card p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-fynlo-dark mb-2">
                Choose CSV file
              </label>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={e => {
                  setFile(e.target.files?.[0] ?? null)
                  setResult(null)
                  setErrorMsg(null)
                }}
                className="block w-full text-sm text-fynlo-body
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-fynlo-bg file:text-fynlo-dark
                  hover:file:bg-gray-200
                  file:cursor-pointer cursor-pointer"
              />
              {file && (
                <p className="text-xs text-fynlo-subtle mt-2">
                  {file.name} &mdash; {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#BC3F1D' }}
            >
              {loading
                ? (mode === 'insert' ? 'Importing…' : 'Updating…')
                : (mode === 'insert' ? 'Import applicants' : 'Update applicants')}
            </button>
          </form>

          {/* Error */}
          {errorMsg && (
            <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-semibold text-red-700">
                {mode === 'insert' ? 'Import failed' : 'Update failed'}
              </p>
              <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
            </div>
          )}

          {/* Success — insert mode */}
          {result && !isUpdateResult(result) && (
            <div className="mt-5 space-y-3">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm font-semibold text-green-800">
                  {result.imported} {result.imported === 1 ? 'applicant' : 'applicants'} imported successfully
                </p>
                {result.errors.length > 0 && (
                  <p className="text-xs text-green-700 mt-1">
                    {result.errors.length} row{result.errors.length > 1 ? 's' : ''} skipped.
                  </p>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-800 mb-2">Skipped rows</p>
                  <ul className="space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-xs text-amber-700">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Link href="/hr" className="block text-center text-sm font-semibold text-fynlo-teal hover:underline">
                View dashboard →
              </Link>
            </div>
          )}

          {/* Success — update mode */}
          {result && isUpdateResult(result) && (
            <div className="mt-5 space-y-3">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm font-semibold text-green-800">
                  {result.updated} {result.updated === 1 ? 'applicant' : 'applicants'} updated successfully
                </p>
                {result.notFound > 0 && (
                  <p className="text-xs text-green-700 mt-1">
                    {result.notFound} email{result.notFound > 1 ? 's' : ''} not found in the system.
                  </p>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-800 mb-2">Notices</p>
                  <ul className="space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-xs text-amber-700">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Link href="/hr" className="block text-center text-sm font-semibold text-fynlo-teal hover:underline">
                View dashboard →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
