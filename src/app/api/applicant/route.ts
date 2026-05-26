import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email } = await request.json()

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('applicants')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        source: 'direct_link',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Applicant insert error:', error)
      // TEMP DIAGNOSTIC — full dump
      return NextResponse.json({
        error: 'Failed to create applicant',
        debug: {
          keys: Object.keys(error as object),
          stringified: JSON.stringify(error, Object.getOwnPropertyNames(error)),
          name: (error as { name?: string }).name,
          toString: String(error),
          dataIsNull: data === null,
          urlHost: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^https?:\/\//, '').split('.')[0],
        },
      }, { status: 500 })
    }

    return NextResponse.json({ applicantId: data.id })
  } catch (err) {
    console.error('Applicant API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
