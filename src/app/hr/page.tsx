import { createAdminClient } from '@/lib/supabase/admin'
import HRNav from '@/components/hr/HRNav'
import StatusDropdown from '@/components/hr/StatusDropdown'
import Link from 'next/link'

type DashboardRow = {
  id: string
  iq_score: number
  iq_label: string
  percentile: number
  status: string
  created_at: string
  applicants: {
    id: string
    first_name: string
    last_name: string
    email: string
  } | null
  test_sessions: {
    time_taken_seconds: number | null
    tab_switches: number
  } | null
}

function formatTime(seconds: number | null): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

const IQ_LABEL_STYLES: Record<string, string> = {
  'Superior':      'bg-purple-100 text-purple-800',
  'Above Average': 'bg-teal-100 text-teal-800',
  'High Average':  'bg-green-100 text-green-800',
  'Average':       'bg-yellow-100 text-yellow-800',
  'Low Average':   'bg-orange-100 text-orange-800',
  'Below Average': 'bg-red-100 text-red-800',
}

const IQ_REFERENCE = [
  { range: '130+',    label: 'Superior',      percentile: 'Top 2%' },
  { range: '115–129', label: 'Above Average', percentile: 'Top 16%' },
  { range: '100–114', label: 'High Average',  percentile: 'Above 50%' },
  { range: '85–99',   label: 'Average',       percentile: 'Middle range' },
  { range: '70–84',   label: 'Low Average',   percentile: 'Below average' },
  { range: 'Below 70',label: 'Below Average', percentile: 'Bottom range' },
]

export default async function HRDashboardPage() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('results')
    .select(`
      id, iq_score, iq_label, percentile, status, created_at,
      applicants (id, first_name, last_name, email),
      test_sessions (time_taken_seconds, tab_switches)
    `)
    .order('created_at', { ascending: false })

  const results = (data ?? []) as unknown as DashboardRow[]

  return (
    <>
      <HRNav />

      <div className="px-4 sm:px-6 py-6 max-w-screen-xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-fynlo-dark">Applicants</h1>
            <p className="text-fynlo-subtle text-sm mt-1">
              {results.length} {results.length === 1 ? 'submission' : 'submissions'}
              {error && ' — error loading results'}
            </p>
          </div>
          <a
            href="/api/hr/export"
            download
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#0084AD' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v7.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V3.75A.75.75 0 0 1 10 3ZM5.75 16a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" clipRule="evenodd" />
            </svg>
            Export CSV
          </a>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main table */}
          <div className="flex-1 min-w-0">
            {results.length === 0 ? (
              <div className="bg-white rounded-card shadow-card px-8 py-16 text-center">
                <p className="text-fynlo-subtle text-sm">No submissions yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-card shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide w-full">
                          Applicant
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide">
                          IQ
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden sm:table-cell">
                          Label
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden md:table-cell">
                          Percentile
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden lg:table-cell">
                          Time
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden md:table-cell">
                          Date
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {results.map(row => {
                        const applicant = row.applicants
                        const session = row.test_sessions
                        const name = applicant
                          ? `${applicant.first_name} ${applicant.last_name}`
                          : 'Unknown'
                        const email = applicant?.email ?? '—'
                        const labelStyle = IQ_LABEL_STYLES[row.iq_label] ?? 'bg-gray-100 text-gray-700'

                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-fynlo-bg/60 transition-colors"
                          >
                            <td className="px-4 py-3 max-w-0 w-full">
                              <Link href={`/hr/applicant/${row.id}`} className="group">
                                <div className="font-semibold text-fynlo-dark group-hover:text-fynlo-teal transition-colors truncate">
                                  {name}
                                </div>
                                <div className="text-fynlo-subtle text-xs mt-0.5 truncate">{email}</div>
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-black text-fynlo-dark text-base">
                                {row.iq_score}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${labelStyle}`}>
                                {row.iq_label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-fynlo-body hidden md:table-cell">
                              {ordinal(row.percentile)}
                            </td>
                            <td className="px-4 py-3 text-center text-fynlo-body hidden lg:table-cell">
                              {formatTime(session?.time_taken_seconds ?? null)}
                            </td>
                            <td className="px-4 py-3 text-fynlo-subtle hidden md:table-cell">
                              {formatDate(row.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusDropdown
                                resultId={row.id}
                                currentStatus={row.status}
                                compact
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Score reference panel */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-card shadow-card p-5 lg:sticky lg:top-6">
              <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-4">
                Score Reference
              </h2>
              <div className="space-y-2">
                {IQ_REFERENCE.map(({ range, label, percentile }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <div className="text-xs font-semibold text-fynlo-dark">{range}</div>
                      <div className="text-xs text-fynlo-subtle mt-0.5">{percentile}</div>
                    </div>
                    <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${IQ_LABEL_STYLES[label] ?? 'bg-gray-100 text-gray-700'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-fynlo-subtle mt-4 leading-relaxed">
                Mean 100, SD 15. Scores normalised from weighted test performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
