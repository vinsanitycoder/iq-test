/**
 * Batch Interview Brief PDF — a compact, comparison-style summary of multiple
 * candidates on a single document. Designed for HR to scan during interviews.
 *
 * Layout: landscape A4, one horizontal row per candidate. Rows wrap to subsequent
 * pages automatically when they exceed page height. Built with @react-pdf/renderer.
 * Uses built-in Helvetica (no external font files — serverless-safe).
 */

import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
} from '@react-pdf/renderer'
import { PERSONALITY_TYPES } from '@/lib/personality/types'
import type { TypeCode } from '@/lib/personality/types'

// ── Brand colours ────────────────────────────────────────────────────────────
const TEAL = '#0084AD'
const DARK = '#003B4C'
const BODY = '#4A6572'
const SUBTLE = '#7A9BAD'
const PAGE_BG = '#F7F7F3'
const WHITE = '#FFFFFF'
const BORDER = '#E2EDF2'
const PURPLE = '#6B21A8'
const PURPLE_BG = '#EDE9FE'

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: PAGE_BG,
    paddingBottom: 36,
  },
  headerBar: {
    backgroundColor: TEAL,
    paddingHorizontal: 28,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: WHITE,
    fontSize: 8,
    opacity: 0.85,
    marginTop: 2,
  },
  headerDate: {
    color: WHITE,
    fontSize: 8,
    opacity: 0.75,
    textAlign: 'right',
  },

  body: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },

  // ── Candidate row ──
  candidateRow: {
    backgroundColor: WHITE,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Identity column (left)
  identityCol: {
    width: '24%',
    paddingRight: 8,
  },
  candidateName: {
    color: DARK,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  candidateEmail: {
    color: BODY,
    fontSize: 8,
    marginBottom: 2,
  },
  candidateRole: {
    color: SUBTLE,
    fontSize: 7,
    marginBottom: 3,
  },
  linkRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 1,
  },
  candidateLink: {
    color: TEAL,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
  },
  linkPlaceholder: {
    color: BORDER,
    fontSize: 7,
  },

  // IQ column (center-left)
  iqCol: {
    width: '18%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  iqBox: {
    backgroundColor: TEAL,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  iqNumber: {
    color: WHITE,
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  iqMini: {
    color: WHITE,
    fontSize: 6,
    opacity: 0.85,
    marginTop: 1,
  },
  iqMeta: {
    flexDirection: 'column',
  },
  iqLabel: {
    color: DARK,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  iqPercentile: {
    color: SUBTLE,
    fontSize: 7,
  },

  // Personality column (center-right)
  personalityCol: {
    width: '34%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  typeBadge: {
    backgroundColor: PURPLE_BG,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  typeCode: {
    color: PURPLE,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  typeName: {
    color: PURPLE,
    fontSize: 6,
    marginTop: 1,
  },
  barsContainer: {
    flex: 1,
  },

  // Mini dimension bar
  dimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dimLabel: {
    color: BODY,
    fontSize: 6,
    width: 8,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
  dimBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    marginHorizontal: 3,
    overflow: 'hidden',
  },
  dimBarFill: {
    height: 4,
    backgroundColor: TEAL,
  },
  dimLabelRight: {
    color: BODY,
    fontSize: 6,
    width: 8,
    fontFamily: 'Helvetica-Bold',
  },
  dimScore: {
    color: SUBTLE,
    fontSize: 6,
    width: 28,
    textAlign: 'right',
  },

  // Notes column (right)
  notesCol: {
    width: '24%',
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
  },
  notesLabel: {
    color: SUBTLE,
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  notesText: {
    color: BODY,
    fontSize: 7,
    lineHeight: 1.4,
  },

  // Placeholder when personality missing
  noPersonality: {
    color: SUBTLE,
    fontSize: 8,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: SUBTLE,
    fontSize: 7,
  },
})

// ── Types ─────────────────────────────────────────────────────────────────────

export type BriefCandidate = {
  applicant: {
    id: string
    first_name: string
    last_name: string
    email: string
    role_applied_for: string | null
    resume_url: string | null
    interview_video_url: string | null
    notes: string | null
  }
  iq: {
    iq_score: number
    iq_label: string
    percentile: number
  } | null
  personality: {
    type_code: string
    ei_score: number; sn_score: number; tf_score: number; jp_score: number
    ei_label: string; sn_label: string; tf_label: string; jp_label: string
  } | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function ordinal(n: number) {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0])
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + '…'
}

// ── Mini dimension bar ───────────────────────────────────────────────────────
// Same fill-from-winning-pole behaviour as the dashboard's DimensionBar.
function MiniBar({
  leftPole, rightPole, score, label,
}: { leftPole: string; rightPole: string; score: number | string; label: string }) {
  const pct = Math.max(0, Math.min(100, Number(score)))
  const isRight = label === rightPole
  const displayPct = Math.round(isRight ? pct : 100 - pct)

  return (
    <View style={s.dimRow}>
      <Text style={s.dimLabel}>{leftPole}</Text>
      <View style={[s.dimBarTrack, {
        flexDirection: 'row',
        justifyContent: isRight ? 'flex-end' : 'flex-start',
      }]}>
        <View style={[s.dimBarFill, { width: `${displayPct}%` }]} />
      </View>
      <Text style={s.dimLabelRight}>{rightPole}</Text>
      <Text style={s.dimScore}>{label}·{displayPct}%</Text>
    </View>
  )
}

// ── Single candidate row ─────────────────────────────────────────────────────
function CandidateRow({ c }: { c: BriefCandidate }) {
  const fullName = `${c.applicant.first_name} ${c.applicant.last_name}`
  const typeCard = c.personality?.type_code
    ? PERSONALITY_TYPES[c.personality.type_code as TypeCode]
    : null

  return (
    <View style={s.candidateRow} wrap={false}>
      {/* Identity */}
      <View style={s.identityCol}>
        <Text style={s.candidateName}>{fullName}</Text>
        <Text style={s.candidateEmail}>{c.applicant.email}</Text>
        <Text style={s.candidateRole}>
          {c.applicant.role_applied_for ?? 'No role specified'}
        </Text>
        <View style={s.linkRow}>
          {c.applicant.resume_url ? (
            <Link src={c.applicant.resume_url} style={s.candidateLink}>Resume ↗</Link>
          ) : (
            <Text style={s.linkPlaceholder}>Resume —</Text>
          )}
          {c.applicant.interview_video_url ? (
            <Link src={c.applicant.interview_video_url} style={s.candidateLink}>Video ↗</Link>
          ) : (
            <Text style={s.linkPlaceholder}>Video —</Text>
          )}
        </View>
      </View>

      {/* IQ */}
      <View style={s.iqCol}>
        {c.iq ? (
          <>
            <View style={s.iqBox}>
              <Text style={s.iqNumber}>{c.iq.iq_score}</Text>
              <Text style={s.iqMini}>IQ</Text>
            </View>
            <View style={s.iqMeta}>
              <Text style={s.iqLabel}>{c.iq.iq_label}</Text>
              <Text style={s.iqPercentile}>{ordinal(c.iq.percentile)} pct</Text>
            </View>
          </>
        ) : (
          <Text style={s.noPersonality}>No IQ data</Text>
        )}
      </View>

      {/* Personality */}
      <View style={s.personalityCol}>
        {c.personality && typeCard ? (
          <>
            <View style={s.typeBadge}>
              <Text style={s.typeCode}>{c.personality.type_code}</Text>
              <Text style={s.typeName}>{truncate(typeCard.name, 14)}</Text>
            </View>
            <View style={s.barsContainer}>
              <MiniBar leftPole="E" rightPole="I"
                score={c.personality.ei_score} label={c.personality.ei_label} />
              <MiniBar leftPole="S" rightPole="N"
                score={c.personality.sn_score} label={c.personality.sn_label} />
              <MiniBar leftPole="T" rightPole="F"
                score={c.personality.tf_score} label={c.personality.tf_label} />
              <MiniBar leftPole="J" rightPole="P"
                score={c.personality.jp_score} label={c.personality.jp_label} />
            </View>
          </>
        ) : (
          <Text style={s.noPersonality}>No personality data</Text>
        )}
      </View>

      {/* Notes */}
      <View style={s.notesCol}>
        <Text style={s.notesLabel}>Notes</Text>
        <Text style={s.notesText}>
          {c.applicant.notes ? truncate(c.applicant.notes, 220) : '—'}
        </Text>
      </View>
    </View>
  )
}

// ── Main document ───────────────────────────────────────────────────────────

export function InterviewBriefDocument({
  candidates,
}: {
  candidates: BriefCandidate[]
}) {
  const now = formatDate(new Date().toISOString())
  const count = candidates.length
  // Sort by IQ score descending (best first), nulls last
  const sorted = [...candidates].sort((a, b) => {
    const aIq = a.iq?.iq_score ?? -1
    const bIq = b.iq?.iq_score ?? -1
    return bIq - aIq
  })

  return (
    <Document title={`Interview Brief — ${count} Candidates`} author="Fynlo Apps HR">
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Header */}
        <View style={s.headerBar}>
          <View>
            <Text style={s.headerTitle}>
              Interview Brief — {count} Candidate{count === 1 ? '' : 's'}
            </Text>
            <Text style={s.headerSub}>Fynlo Apps · HR Platform</Text>
          </View>
          <Text style={s.headerDate}>Generated {now}</Text>
        </View>

        <View style={s.body}>
          {sorted.map((c) => (
            <CandidateRow key={c.applicant.id} c={c} />
          ))}
        </View>

        {/* Footer */}
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
