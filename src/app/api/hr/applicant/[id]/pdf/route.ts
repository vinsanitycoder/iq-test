import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { AssessmentReportDocument } from '@/lib/pdf/AssessmentReport'
import type {
  PDFApplicant,
  PDFIQResult,
  PDFPersonalityResult,
} from '@/lib/pdf/AssessmentReport'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' } as const

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })

  const { id } = await params
  const admin = createAdminClient()

  // ── Applicant ──
  const { data: applicant, error: appError } = await admin
    .from('applicants' as any)
    .select('id, first_name, last_name, email, created_at, role_applied_for, notes')
    .eq('id', id)
    .maybeSingle<PDFApplicant & { id: string }>()

  if (appError || !applicant) {
    return NextResponse.json({ error: 'Applicant not found.' }, { status: 404, headers: NO_STORE })
  }

  // ── IQ Result ──
  const { data: iqResult } = await admin
    .from('results' as any)
    .select(`
      iq_score, iq_label, percentile, raw_score, weighted_score, created_at,
      test_sessions (time_taken_seconds, tab_switches)
    `)
    .eq('applicant_id', applicant.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<PDFIQResult>()

  // ── Personality Result ──
  const { data: personalityResult } = await admin
    .from('personality_results' as any)
    .select('type_code, ei_score, sn_score, tf_score, jp_score, ei_label, sn_label, tf_label, jp_label, total_answers_at_scoring, status, created_at')
    .eq('applicant_id', applicant.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<PDFPersonalityResult>()

  // ── Render PDF ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let buffer: Buffer
  try {
    buffer = await renderToBuffer(
      React.createElement(AssessmentReportDocument, {
        applicant,
        iqResult: iqResult ?? null,
        personalityResult: personalityResult ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
    )
  } catch (err) {
    console.error('[PDF] render error', err)
    return NextResponse.json({ error: 'PDF generation failed.' }, { status: 500, headers: NO_STORE })
  }

  const safeName = `${applicant.first_name}-${applicant.last_name}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="assessment-${safeName}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
