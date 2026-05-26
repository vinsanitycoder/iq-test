import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { InterviewBriefDocument } from '@/lib/pdf/InterviewBrief'
import type { BriefCandidate } from '@/lib/pdf/InterviewBrief'

export const dynamic = 'force-dynamic'
// PDF rendering for many candidates can exceed the Vercel default 10s timeout.
// Vercel Hobby = max 60s, Pro = up to 300s — 60 is a safe ceiling either way.
export const maxDuration = 60

const NO_STORE = { 'Cache-Control': 'no-store' } as const
const MAX_CANDIDATES = 50
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })

  // Validate body
  let body: { applicantIds?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400, headers: NO_STORE })
  }

  if (!Array.isArray(body.applicantIds) || body.applicantIds.length === 0) {
    return NextResponse.json({ error: 'applicantIds must be a non-empty array.' }, { status: 400, headers: NO_STORE })
  }

  if (body.applicantIds.length > MAX_CANDIDATES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_CANDIDATES} candidates per brief.` },
      { status: 400, headers: NO_STORE },
    )
  }

  // Whitelist to valid UUIDs
  const ids = (body.applicantIds as unknown[])
    .filter((id): id is string => typeof id === 'string' && UUID_RE.test(id))

  if (ids.length === 0) {
    return NextResponse.json({ error: 'No valid applicant IDs provided.' }, { status: 400, headers: NO_STORE })
  }

  const admin = createAdminClient()

  // ── Applicants ──
  const { data: applicants, error: aErr } = await admin
    .from('applicants' as never)
    .select('id, first_name, last_name, email, role_applied_for, resume_url, interview_video_url, notes')
    .in('id', ids)
    .returns<{
      id: string
      first_name: string
      last_name: string
      email: string
      role_applied_for: string | null
      resume_url: string | null
      interview_video_url: string | null
      notes: string | null
    }[]>()

  if (aErr || !applicants || applicants.length === 0) {
    return NextResponse.json({ error: 'No applicants found.' }, { status: 404, headers: NO_STORE })
  }

  // ── IQ results (most recent per applicant) ──
  const { data: iqRows } = await admin
    .from('results' as never)
    .select('applicant_id, iq_score, iq_label, percentile, created_at')
    .in('applicant_id', ids)
    .order('created_at', { ascending: false })
    .returns<{
      applicant_id: string
      iq_score: number
      iq_label: string
      percentile: number
      created_at: string
    }[]>()

  const iqByApplicant: Record<string, { iq_score: number; iq_label: string; percentile: number }> = {}
  for (const r of iqRows ?? []) {
    if (!iqByApplicant[r.applicant_id]) {
      iqByApplicant[r.applicant_id] = {
        iq_score: r.iq_score,
        iq_label: r.iq_label,
        percentile: r.percentile,
      }
    }
  }

  // ── Personality results (most recent per applicant) ──
  const { data: prRows } = await admin
    .from('personality_results' as never)
    .select('applicant_id, type_code, ei_score, sn_score, tf_score, jp_score, ei_label, sn_label, tf_label, jp_label, created_at')
    .in('applicant_id', ids)
    .order('created_at', { ascending: false })
    .returns<{
      applicant_id: string
      type_code: string
      ei_score: number
      sn_score: number
      tf_score: number
      jp_score: number
      ei_label: string
      sn_label: string
      tf_label: string
      jp_label: string
      created_at: string
    }[]>()

  const personalityByApplicant: Record<string, Omit<NonNullable<BriefCandidate['personality']>, never>> = {}
  for (const r of prRows ?? []) {
    if (!personalityByApplicant[r.applicant_id]) {
      personalityByApplicant[r.applicant_id] = {
        type_code: r.type_code,
        ei_score: r.ei_score,
        sn_score: r.sn_score,
        tf_score: r.tf_score,
        jp_score: r.jp_score,
        ei_label: r.ei_label,
        sn_label: r.sn_label,
        tf_label: r.tf_label,
        jp_label: r.jp_label,
      }
    }
  }

  // ── Build candidates array ──
  const candidates: BriefCandidate[] = applicants.map(a => ({
    applicant: {
      id: a.id,
      first_name: a.first_name,
      last_name: a.last_name,
      email: a.email,
      role_applied_for: a.role_applied_for,
      resume_url: a.resume_url,
      interview_video_url: a.interview_video_url,
      notes: a.notes,
    },
    iq: iqByApplicant[a.id] ?? null,
    personality: personalityByApplicant[a.id] ?? null,
  }))

  // ── Render PDF ──
  let buffer: Buffer
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(InterviewBriefDocument, { candidates }) as any
    buffer = await renderToBuffer(element)
  } catch (err) {
    console.error('[BatchPDF] render error', err)
    return NextResponse.json({ error: 'PDF generation failed.' }, { status: 500, headers: NO_STORE })
  }

  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="interview-brief-${date}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
