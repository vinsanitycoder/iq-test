import { redirect } from 'next/navigation'
import { validatePersonalityCookie } from '@/lib/personality/session-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function PersonalityCompletePage() {
  const auth = await validatePersonalityCookie()
  if (!auth) redirect('/personality/invalid')

  const { session, invite } = auth
  if (!session) redirect('/personality/welcome')
  if (session.status === 'not_started') redirect('/personality/welcome')

  // If still in_progress (e.g. browser crashed before complete API was called), finalise now
  if (session.status === 'in_progress') {
    const admin = createAdminClient()
    await admin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('personality_sessions' as any)
      .update({ status: 'completed', end_time: new Date().toISOString() })
      .eq('id', session.id)
  }

  // Get applicant's first name for the thank-you message
  const admin = createAdminClient()
  const { data: applicant } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('applicants' as any)
    .select('first_name')
    .eq('id', invite.applicant_id)
    .single<{ first_name: string }>()

  const firstName = applicant?.first_name ?? 'there'

  return (
    <main className="min-h-screen bg-[#F7F7F3] flex flex-col font-[Nunito]">
      <header className="bg-[#0084AD] px-6 py-4">
        <p className="text-white font-semibold text-base">HR Assessment Hub</p>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 text-center">
          {/* Checkmark icon */}
          <div className="w-16 h-16 bg-[#0084AD]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-[#0084AD]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#0084AD] mb-3">
            You&apos;re all done!
          </h1>
          <p className="text-[#4A6572] leading-relaxed mb-2">
            Thank you for completing the assessment, {firstName}.
          </p>
          <p className="text-[#4A6572] leading-relaxed">
            The hiring team will be in touch with you shortly.
          </p>
        </div>
      </div>
    </main>
  )
}
