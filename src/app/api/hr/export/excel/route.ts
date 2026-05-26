import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'
import { PERSONALITY_TYPES } from '@/lib/personality/types'
import type { TypeCode } from '@/lib/personality/types'

export const dynamic = 'force-dynamic'

// ── Teal brand colour for the header row
const TEAL_ARGB = 'FF0084AD'
const WHITE_ARGB = 'FFFFFFFF'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Optional filter: ?applicantIds=uuid1,uuid2,uuid3 — used by "Export selected" buttons
  const filterIdsRaw = req.nextUrl.searchParams.get('applicantIds')
  const filterIds = filterIdsRaw
    ? filterIdsRaw.split(',').map(s => s.trim()).filter(s => UUID_RE.test(s))
    : null

  const admin = createAdminClient()

  // ── IQ results ────────────────────────────────────────────────────────────
  let iqQuery = admin
    .from('results')
    .select(`
      iq_score, iq_label, percentile, raw_score, weighted_score, created_at,
      applicants (id, first_name, last_name, email, status, role_applied_for, resume_url, interview_video_url, notes),
      test_sessions (time_taken_seconds, tab_switches)
    `)
    .order('created_at', { ascending: false })

  if (filterIds && filterIds.length > 0) {
    iqQuery = iqQuery.in('applicant_id', filterIds)
  }

  const { data: iqData, error: iqError } = await iqQuery

  if (iqError) return NextResponse.json({ error: iqError.message }, { status: 500 })

  // ── Personality results (most recent per applicant) ───────────────────────
  const applicantIds = (iqData ?? [])
    .map((r: any) => r.applicants?.id)
    .filter(Boolean) as string[]

  const personalityMap: Record<string, {
    type_code: string
    ei_score: number; sn_score: number; tf_score: number; jp_score: number
    ei_label: string; sn_label: string; tf_label: string; jp_label: string
    total_answers_at_scoring: number
    status: string
  }> = {}

  if (applicantIds.length > 0) {
    const { data: prRows } = await admin
      .from('personality_results' as any)
      .select('applicant_id, type_code, ei_score, sn_score, tf_score, jp_score, ei_label, sn_label, tf_label, jp_label, total_answers_at_scoring, status')
      .in('applicant_id', applicantIds)
      .order('created_at', { ascending: false })
      .returns<{
        applicant_id: string
        type_code: string
        ei_score: number; sn_score: number; tf_score: number; jp_score: number
        ei_label: string; sn_label: string; tf_label: string; jp_label: string
        total_answers_at_scoring: number
        status: string
      }[]>()

    for (const row of prRows ?? []) {
      // most recent wins (array already sorted desc)
      if (!personalityMap[row.applicant_id]) {
        personalityMap[row.applicant_id] = row
      }
    }
  }

  // ── Build workbook ────────────────────────────────────────────────────────
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Fynlo Apps HR'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Applicants', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'First Name',           key: 'first_name',               width: 16 },
    { header: 'Last Name',            key: 'last_name',                width: 16 },
    { header: 'Email',                key: 'email',                    width: 28 },
    { header: 'Role Applied For',     key: 'role_applied_for',         width: 22 },
    { header: 'Applicant Status',     key: 'status',                   width: 18 },
    { header: 'Notes',                key: 'notes',                    width: 30 },
    // IQ
    { header: 'IQ Score',             key: 'iq_score',                 width: 12 },
    { header: 'IQ Label',             key: 'iq_label',                 width: 16 },
    { header: 'Percentile',           key: 'percentile',               width: 14 },
    { header: 'Raw Score',            key: 'raw_score',                width: 12 },
    { header: 'Weighted Score',       key: 'weighted_score',           width: 16 },
    { header: 'Time Taken (s)',       key: 'time_taken_seconds',       width: 14 },
    { header: 'Tab Switches',         key: 'tab_switches',             width: 14 },
    { header: 'IQ Test Date',         key: 'iq_date',                  width: 14 },
    // Personality
    { header: 'Personality Type',     key: 'type_code',                width: 16 },
    { header: 'Type Name',            key: 'type_name',                width: 20 },
    { header: 'E/I Score (%)',        key: 'ei_score',                 width: 14 },
    { header: 'E/I Result',           key: 'ei_label',                 width: 12 },
    { header: 'S/N Score (%)',        key: 'sn_score',                 width: 14 },
    { header: 'S/N Result',           key: 'sn_label',                 width: 12 },
    { header: 'T/F Score (%)',        key: 'tf_score',                 width: 14 },
    { header: 'T/F Result',           key: 'tf_label',                 width: 12 },
    { header: 'J/P Score (%)',        key: 'jp_score',                 width: 14 },
    { header: 'J/P Result',           key: 'jp_label',                 width: 12 },
    { header: 'Answers at Scoring',   key: 'total_answers',            width: 18 },
    { header: 'Personality Status',   key: 'personality_status',       width: 18 },
    // Links
    { header: 'Resume URL',           key: 'resume_url',               width: 30 },
    { header: 'Interview Video URL',  key: 'interview_video_url',      width: 30 },
  ]

  // Style the header row
  const headerRow = sheet.getRow(1)
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: WHITE_ARGB }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_ARGB } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false }
    cell.border = {
      bottom: { style: 'thin', color: { argb: WHITE_ARGB } },
    }
  })
  headerRow.height = 20

  // Add data rows
  for (const row of (iqData ?? []) as any[]) {
    const a = row.applicants
    const s = row.test_sessions
    const p = personalityMap[a?.id ?? '']
    const typeCard = p?.type_code ? PERSONALITY_TYPES[p.type_code as TypeCode] : undefined

    sheet.addRow({
      first_name:           a?.first_name ?? '',
      last_name:            a?.last_name ?? '',
      email:                a?.email ?? '',
      role_applied_for:     a?.role_applied_for ?? '',
      status:               a?.status ?? 'pending_review',
      notes:                a?.notes ?? '',
      iq_score:             row.iq_score ?? '',
      iq_label:             row.iq_label ?? '',
      percentile:           row.percentile ?? '',
      raw_score:            row.raw_score ?? '',
      weighted_score:       row.weighted_score ?? '',
      time_taken_seconds:   s?.time_taken_seconds ?? '',
      tab_switches:         s?.tab_switches ?? 0,
      iq_date:              row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
      type_code:            p?.type_code ?? '',
      type_name:            typeCard?.name ?? '',
      ei_score:             p ? Number(p.ei_score).toFixed(1) : '',
      ei_label:             p?.ei_label ?? '',
      sn_score:             p ? Number(p.sn_score).toFixed(1) : '',
      sn_label:             p?.sn_label ?? '',
      tf_score:             p ? Number(p.tf_score).toFixed(1) : '',
      tf_label:             p?.tf_label ?? '',
      jp_score:             p ? Number(p.jp_score).toFixed(1) : '',
      jp_label:             p?.jp_label ?? '',
      total_answers:        p?.total_answers_at_scoring ?? '',
      personality_status:   p?.status ?? '',
      resume_url:           a?.resume_url ?? '',
      interview_video_url:  a?.interview_video_url ?? '',
    })
  }

  // Zebra striping for data rows
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const isEven = rowNumber % 2 === 0
    row.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF7F7F3' : 'FFFFFFFF' },
      }
      cell.alignment = { vertical: 'middle', wrapText: false }
    })
  })

  // Produce buffer and return
  const buffer = await workbook.xlsx.writeBuffer()
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="applicants-${date}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}
