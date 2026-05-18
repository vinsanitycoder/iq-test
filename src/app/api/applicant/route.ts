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
      return NextResponse.json({ error: 'Failed to create applicant' }, { status: 500 })
    }

    return NextResponse.json({ applicantId: data.id })
  } catch (err) {
    console.error('Applicant API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
