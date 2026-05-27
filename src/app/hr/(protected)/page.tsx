import HRNav from '@/components/hr/HRNav'
import DashboardTable from '@/components/hr/DashboardTable'
import AutoInviteBanner from '@/components/hr/AutoInviteBanner'

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

export default function HRDashboardPage() {
  return (
    <>
      <HRNav />

      <div className="px-4 sm:px-6 py-6 max-w-screen-xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-fynlo-dark">Applicants</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/api/hr/export"
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-fynlo-teal text-fynlo-teal bg-white transition-opacity hover:opacity-70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v7.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V3.75A.75.75 0 0 1 10 3ZM5.75 16a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" clipRule="evenodd" />
              </svg>
              CSV
            </a>
            <a
              href="/api/hr/export/excel"
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#0084AD' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v7.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V3.75A.75.75 0 0 1 10 3ZM5.75 16a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" clipRule="evenodd" />
              </svg>
              Export Excel
            </a>
          </div>
        </div>

        <AutoInviteBanner />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <DashboardTable />
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
