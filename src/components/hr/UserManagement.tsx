'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type HRUser = {
  id: string
  email: string
  isAdmin: boolean
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function UserManagement() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [users, setUsers] = useState<HRUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdPassword, setCreatedPassword] = useState<string | null>(null)
  const [createMsg, setCreateMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<HRUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [resettingId, setResettingId] = useState<string | null>(null)
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({})

  const [roleMsg, setRoleMsg] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(user?.app_metadata?.role === 'admin')
      setCurrentUserId(user?.id ?? '')
    })
  }, [])

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/hr/admin/users', { cache: 'no-store' })
      const json = await res.json()
      setUsers(json.users ?? [])
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin, loadUsers])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateMsg(null)
    setCreatedPassword(null)
    try {
      const res = await fetch('/api/hr/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      })
      const json = await res.json()
      if (!res.ok) {
        setCreateMsg({ ok: false, text: json.error ?? 'Something went wrong.' })
      } else {
        setCreatedPassword(json.password)
        setNewEmail('')
        loadUsers()
      }
    } catch {
      setCreateMsg({ ok: false, text: 'Network error. Please try again.' })
    } finally {
      setCreating(false)
    }
  }

  async function handleResetPassword(user: HRUser) {
    setResettingId(user.id)
    setResetPasswords(p => { const n = { ...p }; delete n[user.id]; return n })
    try {
      const res = await fetch('/api/hr/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const json = await res.json()
      if (res.ok) {
        setResetPasswords(p => ({ ...p, [user.id]: json.password }))
      } else {
        setRoleMsg(json.error ?? 'Could not reset password.')
      }
    } catch {
      setRoleMsg('Network error. Please try again.')
    } finally {
      setResettingId(null)
    }
  }

  async function handleRoleToggle(user: HRUser) {
    setRoleMsg(null)
    const res = await fetch('/api/hr/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, makeAdmin: !user.isAdmin }),
    })
    const json = await res.json()
    if (!res.ok) {
      setRoleMsg(json.error ?? 'Could not update role.')
    } else {
      loadUsers()
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch('/api/hr/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deleteTarget.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setRoleMsg(json.error ?? 'Could not delete user.')
      } else {
        loadUsers()
      }
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (isAdmin === null) return null
  if (!isAdmin) return null

  return (
    <div className="bg-white rounded-card shadow-card p-5 mt-5">
      <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-5">
        User Management
      </h2>

      {/* User list */}
      <div className="mb-6">
        {loadingUsers ? (
          <p className="text-sm text-fynlo-subtle">Loading users…</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map(user => (
              <div key={user.id}>
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-fynlo-dark truncate">{user.email}</span>
                    {user.isAdmin && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-fynlo-teal/10 text-fynlo-teal">
                        Admin
                      </span>
                    )}
                    {user.id === currentUserId && (
                      <span className="text-xs text-fynlo-subtle">(you)</span>
                    )}
                  </div>
                  <div className="text-xs text-fynlo-subtle mt-0.5">Added {formatDate(user.createdAt)}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResetPassword(user)}
                    disabled={resettingId === user.id}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-fynlo-body hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {resettingId === user.id ? 'Resetting…' : 'Reset password'}
                  </button>
                  <button
                    onClick={() => handleRoleToggle(user)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-fynlo-body hover:bg-gray-50 transition-colors"
                  >
                    {user.isAdmin ? 'Remove admin' : 'Make admin'}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(user)}
                    disabled={user.id === currentUserId}
                    title={user.id === currentUserId ? 'You cannot delete your own account' : 'Delete user'}
                    className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {resetPasswords[user.id] && (
                <div className="mb-2 p-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <p className="text-xs font-semibold text-teal-800 mb-1">Password reset — share this with {user.email.split('@')[0]}</p>
                  <div className="flex items-center gap-3 bg-white border border-teal-200 rounded-lg px-3 py-2">
                    <span className="font-mono text-sm font-bold text-fynlo-dark tracking-wide flex-1">
                      {resetPasswords[user.id]}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(resetPasswords[user.id])}
                      className="text-xs font-semibold text-fynlo-teal hover:text-fynlo-dark transition-colors shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
              </div>
            ))}
          </div>
        )}
        {roleMsg && (
          <p className="text-xs text-red-600 font-semibold mt-2">{roleMsg}</p>
        )}
      </div>

      {/* Add user form */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-bold text-fynlo-dark mb-3">Add new user</h3>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={e => { setNewEmail(e.target.value); setCreateMsg(null); setCreatedPassword(null) }}
            required
            placeholder="email@example.com"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-fynlo-dark placeholder:text-fynlo-subtle focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 focus:border-fynlo-teal"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity disabled:opacity-40 shrink-0"
            style={{ backgroundColor: '#0084AD' }}
          >
            {creating ? 'Creating…' : 'Create user'}
          </button>
        </form>

        {createMsg && (
          <p className={`text-sm font-semibold mt-3 ${createMsg.ok ? 'text-green-700' : 'text-red-600'}`}>
            {createMsg.text}
          </p>
        )}

        {createdPassword && (
          <div className="mt-3 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <p className="text-sm font-semibold text-teal-800 mb-1">User created successfully</p>
            <p className="text-sm text-teal-700 mb-2">
              Share this temporary password with the new user. They can change it in Settings after logging in.
            </p>
            <div className="flex items-center gap-3 bg-white border border-teal-200 rounded-lg px-4 py-2.5">
              <span className="font-mono text-sm font-bold text-fynlo-dark tracking-wide flex-1">
                {createdPassword}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(createdPassword)}
                className="text-xs font-semibold text-fynlo-teal hover:text-fynlo-dark transition-colors shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget && !deleting) setDeleteTarget(null) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-black text-fynlo-dark mb-2">Delete user?</h2>
            <p className="text-sm text-fynlo-body mb-6">
              This will permanently delete the account for{' '}
              <span className="font-semibold text-fynlo-dark">{deleteTarget.email}</span>.
              They will no longer be able to log in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
