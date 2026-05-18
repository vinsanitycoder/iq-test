import { createClient } from '@/lib/supabase/server'
import { TestHeader } from '@/components/TestHeader'
import type { Settings } from '@/types/database'

const DEFAULTS = {
  company_name: 'Fynlo',
  completion_message:
    'Thank you for completing the assessment. We really appreciate you taking the time.',
  confidentiality_text:
    'Your results are confidential and will only be shared with the hiring team.',
  whats_next_text: "We'll review your results and be in touch with next steps soon.",
}

export default async function CompletePage() {
  const supabase = await createClient()
  const { data: settingsRaw } = await supabase.from('settings').select('*').single()
  const settings = settingsRaw as Settings | null

  const s = {
    company_name: settings?.company_name ?? DEFAULTS.company_name,
    completion_message: settings?.completion_message ?? DEFAULTS.completion_message,
    confidentiality_text: settings?.confidentiality_text ?? DEFAULTS.confidentiality_text,
    whats_next_text: settings?.whats_next_text ?? DEFAULTS.whats_next_text,
  }

  return (
    <main className="min-h-screen bg-fynlo-bg">
      <div className="mx-auto max-w-app">
        <TestHeader companyName={s.company_name} />

        <div className="mx-4 -mt-4 pb-6">
          <div className="bg-white rounded-card shadow-card p-5 pb-7">

            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#E8F5FA] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path
                    d="M6 16l8 8 12-14"
                    stroke="#0084AD"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-black text-fynlo-dark text-center mb-2">
              Test submitted!
            </h1>
            <p className="text-sm text-fynlo-body text-center mb-7">
              Your test has been successfully submitted.
            </p>

            <div className="flex flex-col gap-4">
              <div className="bg-fynlo-statbg rounded-xl p-4">
                <p className="text-sm text-fynlo-body leading-relaxed">
                  {s.completion_message}
                </p>
              </div>

              {s.confidentiality_text && (
                <div className="border border-[#E8F1F5] rounded-xl p-4">
                  <p className="text-xs font-bold text-fynlo-dark mb-1.5">Confidentiality</p>
                  <p className="text-sm text-fynlo-body leading-relaxed">
                    {s.confidentiality_text}
                  </p>
                </div>
              )}

              {s.whats_next_text && (
                <div className="border border-[#E8F1F5] rounded-xl p-4">
                  <p className="text-xs font-bold text-fynlo-dark mb-1.5">What happens next</p>
                  <p className="text-sm text-fynlo-body leading-relaxed">
                    {s.whats_next_text}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
