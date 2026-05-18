import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml']
const BUCKET = 'logos'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, and SVG files are accepted.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be 2 MB or smaller.' }, { status: 400 })
  }

  const ext = file.type === 'image/svg+xml' ? 'svg' : file.type === 'image/png' ? 'png' : 'jpg'
  const filename = `company-logo.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(filename, bytes, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(filename)
  const publicUrl = urlData.publicUrl

  const { data: existing } = await admin.from('settings').select('id').single()
  const logoPayload = { company_logo_url: publicUrl, updated_at: new Date().toISOString() }

  let error
  if (existing?.id) {
    ;({ error } = await admin.from('settings').update(logoPayload).eq('id', existing.id))
  } else {
    ;({ error } = await admin.from('settings').insert({ company_name: 'Fynlo', ...logoPayload }))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ url: publicUrl })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Remove all logo files from storage
  const { data: files } = await admin.storage.from(BUCKET).list()
  if (files && files.length > 0) {
    await admin.storage.from(BUCKET).remove(files.map(f => f.name))
  }

  // Clear the URL in settings
  const { data: existing } = await admin.from('settings').select('id').single()
  if (existing?.id) {
    await admin.from('settings').update({ company_logo_url: null, updated_at: new Date().toISOString() }).eq('id', existing.id)
  }

  return NextResponse.json({ ok: true })
}
