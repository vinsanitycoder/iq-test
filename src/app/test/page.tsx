import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TestHeader } from '@/components/TestHeader'
import type { Settings } from '@/types/database'

const DEFAULTS = {
  company_name: 'Fynlo',
  company_logo_url: null as string | null,
  test_name: 'Applicant Logical Test',
  welcome_headline: 'Ready to show what you can do?',
  welcome_body:
    'This short test helps us understand how you approach problems. There are no tricks — just take your time and do your best.',
}

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: settingsRaw } = await supabase.from('settings').select('*').single()
  const settings = settingsRaw as Settings | null

  const s = {
    company_name: settings?.company_name ?? DEFAULTS.company_name,
    company_logo_url: settings?.company_logo_url ?? DEFAULTS.company_logo_url,
    test_name: settings?.test_name ?? DEFAULTS.test_name,
    welcome_headline: settings?.welcome_headline ?? DEFAULTS.welcome_headline,
    welcome_body: settings?.welcome_body ?? DEFAULTS.welcome_body,
  }

  return (
    <main className="min-h-screen bg-fynlo-bg">
      <div className="mx-auto max-w-app">
        <TestHeader companyName={s.company_name} logoUrl={s.company_logo_url} />

        <div className="mx-4 -mt-4">
          <div className="bg-white rounded-card shadow-card p-5 pb-7">
            {/* Badge */}
            <div className="flex justify-center mb-5">
              <span className="bg-fynlo-lime text-fynlo-dark text-xs font-black px-4 py-1 rounded-full">
                {s.test_name}
              </span>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-fynlo-statbg rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-fynlo-teal">40</p>
                <p className="text-xs text-fynlo-subtle mt-0.5">Questions</p>
              </div>
              <div className="bg-fynlo-statbg rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-fynlo-teal">25</p>
                <p className="text-xs text-fynlo-subtle mt-0.5">Minutes</p>
              </div>
              <div className="bg-fynlo-statbg rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-fynlo-terra">5</p>
                <p className="text-xs text-fynlo-subtle mt-0.5">Types</p>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-black text-fynlo-dark leading-tight mb-3">
              {s.welcome_headline}
            </h1>

            {/* Body */}
            <p className="text-fynlo-body text-base leading-relaxed mb-6">
              {s.welcome_body}
            </p>

            {/* CTA */}
            <Link
              href="/test/register"
              className="block w-full bg-fynlo-terra text-white text-center text-base font-black py-4 rounded-btn hover:opacity-90 transition-opacity"
            >
              Start
            </Link>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </main>
  )
}
