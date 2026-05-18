import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return null
  return user
}

function generatePassword() {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `Welcome@${digits}`
}

// List all HR users
export async function GET() {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    isAdmin: u.app_metadata?.role === 'admin',
    createdAt: u.created_at,
  }))

  return NextResponse.json({ users }, { headers: { 'Cache-Control': 'no-store' } })
}

// Create a new HR user
export async function POST(req: NextRequest) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const password = generatePassword()
  const admin = createAdminClient()

  const { error } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  })

  if (error) {
    const msg = error.message.includes('already registered')
      ? 'An account with this email already exists.'
      : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ ok: true, password })
}

// Grant or revoke admin role
export async function PATCH(req: NextRequest) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, makeAdmin } = await req.json()
  if (!userId || typeof makeAdmin !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Guard: cannot remove admin from the last admin account
  if (!makeAdmin) {
    const { data } = await admin.auth.admin.listUsers()
    const admins = (data?.users ?? []).filter(u => u.app_metadata?.role === 'admin')
    if (admins.length <= 1 && admins[0]?.id === userId) {
      return NextResponse.json({ error: 'Cannot remove admin from the last admin account.' }, { status: 400 })
    }
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: makeAdmin ? 'admin' : null },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Delete an HR user
export async function DELETE(req: NextRequest) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  // Guard: cannot delete yourself
  if (userId === caller.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Guard: cannot delete the last admin
  const { data } = await admin.auth.admin.listUsers()
  const target = data?.users.find(u => u.id === userId)
  if (target?.app_metadata?.role === 'admin') {
    const admins = (data?.users ?? []).filter(u => u.app_metadata?.role === 'admin')
    if (admins.length <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last admin account.' }, { status: 400 })
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
