/**
 * PDF Assessment Report — rendered server-side with @react-pdf/renderer.
 * Uses built-in Helvetica font for serverless compatibility (no external font files).
 * Fynlo brand colours: teal #0084AD, dark #003B4C, warm bg #F7F7F3.
 */

import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'
import { PERSONALITY_TYPES } from '@/lib/personality/types'
import type { TypeCode } from '@/lib/personality/types'

// ── Colours (PDF uses hex strings) ───────────────────────────────────────────
const TEAL = '#0084AD'
const DARK = '#003B4C'
const BODY = '#4A6572'
const SUBTLE = '#7A9BAD'
const PAGE_BG = '#F7F7F3'
const WHITE = '#FFFFFF'
const BORDER = '#E2EDF2'
const PURPLE = '#6B21A8'

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: PAGE_BG,
    paddingBottom: 40,
  },

  // Header bar
  headerBar: {
    backgroundColor: TEAL,
    paddingHorizontal: 32,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: WHITE,
    fontSize: 9,
    opacity: 0.8,
    marginTop: 2,
  },
  headerDate: {
    color: WHITE,
    fontSize: 9,
    opacity: 0.75,
    textAlign: 'right',
  },

  // Body padding
  body: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },

  // Card
  card: {
    backgroundColor: WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: DARK,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderLabel: {
    color: WHITE,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // Row in a card
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  field: {
    flex: 1,
    minWidth: '40%',
    marginBottom: 6,
    paddingRight: 12,
  },
  fieldLabel: {
    color: SUBTLE,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  fieldValue: {
    color: DARK,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  fieldValueBold: {
    color: DARK,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },

  // IQ score highlight
  iqScoreBox: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  iqScoreNumber: {
    color: WHITE,
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
  },
  iqScoreLabel: {
    color: WHITE,
    fontSize: 8,
    opacity: 0.85,
    marginTop: 2,
  },

  // Personality type badge
  typeBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  typeCode: {
    color: PURPLE,
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  typeName: {
    color: PURPLE,
    fontSize: 8,
    marginTop: 2,
  },

  // Dimension bar
  dimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dimLabel: {
    color: BODY,
    fontSize: 8,
    width: 14,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
  dimBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: BORDER,
    borderRadius: 4,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  dimBarFill: {
    height: 8,
    backgroundColor: TEAL,
    // No borderRadius — track overflow:hidden handles clipping
  },
  dimLabelRight: {
    color: BODY,
    fontSize: 8,
    width: 14,
    fontFamily: 'Helvetica-Bold',
  },
  dimScore: {
    color: SUBTLE,
    fontSize: 7,
    width: 36,
    textAlign: 'right',
  },

  // Description text
  description: {
    color: BODY,
    fontSize: 9,
    lineHeight: 1.5,
    marginTop: 10,
    marginBottom: 4,
  },

  // Notes
  notesText: {
    color: BODY,
    fontSize: 9,
    lineHeight: 1.6,
  },

  // Not-completed placeholder
  placeholder: {
    color: SUBTLE,
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 10,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: SUBTLE,
    fontSize: 7,
  },
})

// ── Types ─────────────────────────────────────────────────────────────────────

export type PDFApplicant = {
  first_name: string
  last_name: string
  email: string
  role_applied_for: string | null
  notes: string | null
  created_at: string
}

export type PDFIQResult = {
  iq_score: number
  iq_label: string
  percentile: number
  raw_score: number
  weighted_score: number
  created_at: string
  test_sessions: {
    time_taken_seconds: number | null
    tab_switches: number
  } | null
} | null

export type PDFPersonalityResult = {
  type_code: string
  ei_score: number; sn_score: number; tf_score: number; jp_score: number
  ei_label: string; sn_label: string; tf_label: string; jp_label: string
  total_answers_at_scoring: number
  status: string
  created_at: string
} | null

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number | null) {
  if (seconds == null) return '—'
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

// ── Dimension bar sub-component ───────────────────────────────────────────────
// Mirrors the behaviour of DimensionBar.tsx in the web dashboard:
// - Bar fills from the WINNING pole's side (not always left)
// - Displayed percentage is the dominance %, not the raw 0→100 score
// - Score 0 = fully leftPole, 100 = fully rightPole
function DimBar({
  leftPole, rightPole, score, label,
}: { leftPole: string; rightPole: string; score: number | string; label: string }) {
  // DB numeric(5,2) columns may arrive as strings — coerce explicitly
  const pct = Math.max(0, Math.min(100, Number(score)))
  const isRight = label === rightPole
  // Dominance % — always 50–100 toward the winning pole
  const displayPct = Math.round(isRight ? pct : 100 - pct)

  return (
    <View style={s.dimRow}>
      <Text style={s.dimLabel}>{leftPole}</Text>
      {/* Bar fills from the winning pole's side */}
      <View style={[s.dimBarTrack, {
        flexDirection: 'row',
        justifyContent: isRight ? 'flex-end' : 'flex-start',
      }]}>
        <View style={[s.dimBarFill, { width: `${displayPct}%` }]} />
      </View>
      <Text style={s.dimLabelRight}>{rightPole}</Text>
      <Text style={s.dimScore}>{label} {displayPct}%</Text>
    </View>
  )
}

// ── Main document ─────────────────────────────────────────────────────────────

export function AssessmentReportDocument({
  applicant,
  iqResult,
  personalityResult,
}: {
  applicant: PDFApplicant
  iqResult: PDFIQResult
  personalityResult: PDFPersonalityResult
}) {
  const now = formatDate(new Date().toISOString())
  const fullName = `${applicant.first_name} ${applicant.last_name}`
  const typeCard = personalityResult?.type_code
    ? PERSONALITY_TYPES[personalityResult.type_code as TypeCode]
    : null

  return (
    <Document title={`Assessment Report — ${fullName}`} author="Fynlo Apps HR">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.headerBar}>
          <View>
            <Text style={s.headerTitle}>Assessment Report</Text>
            <Text style={s.headerSub}>Fynlo Apps · HR Platform</Text>
          </View>
          <Text style={s.headerDate}>Generated {now}</Text>
        </View>

        <View style={s.body}>

          {/* ── Applicant Info ── */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardHeaderLabel}>Applicant</Text>
            </View>
            <View style={s.cardBody}>
              <View style={s.row}>
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Full Name</Text>
                  <Text style={s.fieldValueBold}>{fullName}</Text>
                </View>
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Email Address</Text>
                  <Text style={s.fieldValue}>{applicant.email}</Text>
                </View>
              </View>
              <View style={s.row}>
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Role Applied For</Text>
                  <Text style={s.fieldValue}>{applicant.role_applied_for ?? '—'}</Text>
                </View>
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Application Date</Text>
                  <Text style={s.fieldValue}>{formatDate(applicant.created_at)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── IQ Results ── */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardHeaderLabel}>IQ / Logical Reasoning Assessment</Text>
            </View>
            <View style={s.cardBody}>
              {iqResult ? (
                <View style={s.row}>
                  {/* Score box */}
                  <View style={s.iqScoreBox}>
                    <Text style={s.iqScoreNumber}>{iqResult.iq_score}</Text>
                    <Text style={s.iqScoreLabel}>IQ Score</Text>
                  </View>
                  {/* Details grid */}
                  <View style={{ flex: 1 }}>
                    <View style={s.row}>
                      <View style={s.field}>
                        <Text style={s.fieldLabel}>Label</Text>
                        <Text style={s.fieldValueBold}>{iqResult.iq_label}</Text>
                      </View>
                      <View style={s.field}>
                        <Text style={s.fieldLabel}>Percentile</Text>
                        <Text style={s.fieldValue}>{ordinal(iqResult.percentile)}</Text>
                      </View>
                    </View>
                    <View style={s.row}>
                      <View style={s.field}>
                        <Text style={s.fieldLabel}>Time Taken</Text>
                        <Text style={s.fieldValue}>
                          {formatTime(iqResult.test_sessions?.time_taken_seconds ?? null)}
                        </Text>
                      </View>
                      <View style={s.field}>
                        <Text style={s.fieldLabel}>Tab Switches</Text>
                        <Text style={s.fieldValue}>{iqResult.test_sessions?.tab_switches ?? 0}</Text>
                      </View>
                    </View>
                    <View style={s.row}>
                      <View style={s.field}>
                        <Text style={s.fieldLabel}>Test Date</Text>
                        <Text style={s.fieldValue}>{formatDate(iqResult.created_at)}</Text>
                      </View>
                      <View style={s.field}>
                        <Text style={s.fieldLabel}>Raw / Weighted Score</Text>
                        <Text style={s.fieldValue}>{iqResult.raw_score} / {iqResult.weighted_score}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={s.placeholder}>IQ assessment not yet completed.</Text>
              )}
            </View>
          </View>

          {/* ── Personality Results ── */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardHeaderLabel}>Personality Assessment</Text>
            </View>
            <View style={s.cardBody}>
              {personalityResult && typeCard ? (
                <>
                  <View style={s.row}>
                    {/* Type badge */}
                    <View style={s.typeBadge}>
                      <Text style={s.typeCode}>{personalityResult.type_code}</Text>
                      <Text style={s.typeName}>{typeCard.name}</Text>
                    </View>
                    {/* Summary fields */}
                    <View style={{ flex: 1 }}>
                      <View style={s.row}>
                        <View style={s.field}>
                          <Text style={s.fieldLabel}>Questions Answered</Text>
                          <Text style={s.fieldValue}>{personalityResult.total_answers_at_scoring} / 100</Text>
                        </View>
                        <View style={s.field}>
                          <Text style={s.fieldLabel}>Test Date</Text>
                          <Text style={s.fieldValue}>{formatDate(personalityResult.created_at)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={s.description}>{typeCard.description}</Text>

                  {/* Dimension bars — score is raw 0–100 (0=left pole, 100=right pole) */}
                  <DimBar
                    leftPole="E" rightPole="I"
                    score={personalityResult.ei_score}
                    label={personalityResult.ei_label}
                  />
                  <DimBar
                    leftPole="S" rightPole="N"
                    score={personalityResult.sn_score}
                    label={personalityResult.sn_label}
                  />
                  <DimBar
                    leftPole="T" rightPole="F"
                    score={personalityResult.tf_score}
                    label={personalityResult.tf_label}
                  />
                  <DimBar
                    leftPole="J" rightPole="P"
                    score={personalityResult.jp_score}
                    label={personalityResult.jp_label}
                  />

                  {/* Strengths */}
                  {typeCard.strengths.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={[s.fieldLabel, { marginBottom: 4 }]}>Key Strengths</Text>
                      {typeCard.strengths.map((str, i) => (
                        <Text key={i} style={[s.fieldValue, { fontSize: 8, marginBottom: 3, color: BODY }]}>
                          {'• '}{str}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Watch-outs */}
                  {typeCard.watchOuts.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={[s.fieldLabel, { marginBottom: 4 }]}>Watch-Outs</Text>
                      {typeCard.watchOuts.map((w, i) => (
                        <Text key={i} style={[s.fieldValue, { fontSize: 8, marginBottom: 3, color: BODY }]}>
                          {'• '}{w}
                        </Text>
                      ))}
                    </View>
                  )}
                </>
              ) : personalityResult?.status === 'incomplete' ? (
                <Text style={s.placeholder}>
                  Personality assessment was submitted but did not meet the minimum question threshold (60/100).
                </Text>
              ) : (
                <Text style={s.placeholder}>Personality assessment not yet completed.</Text>
              )}
            </View>
          </View>

          {/* ── Notes ── */}
          {applicant.notes && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardHeaderLabel}>HR Notes</Text>
              </View>
              <View style={s.cardBody}>
                <Text style={s.notesText}>{applicant.notes}</Text>
              </View>
            </View>
          )}

        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Fynlo Apps — Confidential HR Report</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>

      </Page>
    </Document>
  )
}
